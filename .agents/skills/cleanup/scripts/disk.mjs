import { execFile, execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from 'node:fs';
import { availableParallelism, homedir, tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const GB = 1024 ** 3;
const LEVELS = 5;
const SPLIT_LIMIT = 1000;
const ARG_BYTES = 100_000;

// du and find exit 1 when they cannot read a folder, and still print what they
// read everywhere else.
const output = (command, args) =>
  new Promise((done) => {
    execFile(command, args, { encoding: 'utf8', maxBuffer: GB }, (_error, stdout) => done(stdout ?? ''));
  });

async function pool(items, run) {
  const results = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const at = next++;
      results[at] = await run(items[at]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(availableParallelism(), items.length) }, worker));
  return results;
}

const entries = (dir) => {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => !entry.isSymbolicLink())
      .map((entry) => join(dir, entry.name));
  } catch {
    return [];
  }
};

const inside = (path, dir) => path === dir || path.startsWith(`${dir}${sep}`);

// The entries share du runs, dealt out in turn so one big folder's children
// land in different runs, because with one du per path a report over a temp
// folder of 2.2 million second-level entries had not finished after 27 minutes.
// A run's paths are capped at ARG_BYTES, well under the
// 1 MiB kern.argmax past which spawn fails with E2BIG.
function batchesOf(paths) {
  const runs = Math.min(availableParallelism() * 4, paths.length);
  const batches = [];
  for (let run = 0; run < runs; run++) {
    let batch = [];
    let bytes = 0;
    for (let at = run; at < paths.length; at += runs) {
      if (batch.length > 0 && bytes + paths[at].length > ARG_BYTES) {
        batches.push(batch);
        batch = [];
        bytes = 0;
      }
      batch.push(paths[at]);
      bytes += paths[at].length + 1;
    }
    batches.push(batch);
  }
  return batches;
}

// A root with few entries is measured from two levels down, which splits a
// folder that holds most of the disk, such as ~/Library, across the cores. -l
// counts every hard link in full, so an entry's size does not depend on which
// run measured it. Only the paths a run was given and folders of at least
// floor bytes are kept, because a temp folder's du prints hundreds of
// thousands of lines.
async function measure(roots, floor) {
  const sizes = new Map();
  const listed = roots.map((root) => [root, entries(root)]);
  const runs = [];
  for (const [, firsts] of listed) {
    const split = firsts.length <= SPLIT_LIMIT;
    const paths = split
      ? firsts.flatMap((path) => {
          const inner = entries(path);
          return inner.length > 0 ? inner : [path];
        })
      : firsts;
    for (const batch of batchesOf(paths)) runs.push([LEVELS - (split ? 2 : 1), batch]);
  }
  const given = new Set(runs.flatMap(([, paths]) => paths));
  for (const out of await pool(runs, ([depth, paths]) => output('du', ['-k', '-l', '-x', '-d', String(depth), ...paths]))) {
    for (const line of out.split('\n')) {
      const tab = line.indexOf('\t');
      if (tab <= 0) continue;
      const path = line.slice(tab + 1);
      const bytes = Number(line.slice(0, tab)) * 1024;
      if (bytes >= floor || given.has(path)) sizes.set(path, bytes);
    }
  }
  const total = (path) => entries(path).reduce((sum, each) => sum + (sizes.get(each) ?? 0), 0);
  for (const [root, firsts] of listed) {
    for (const path of firsts) if (!sizes.has(path)) sizes.set(path, total(path));
    sizes.set(root, firsts.reduce((sum, path) => sum + sizes.get(path), 0));
  }
  return sizes;
}

function worktreeOf(path) {
  try {
    const dotgit = join(path, '.git');
    if (!lstatSync(dotgit).isFile()) return null;
    const gitdir = /^gitdir: (.+)$/mu.exec(readFileSync(dotgit, 'utf8'))?.[1];
    if (!gitdir?.includes(`${sep}worktrees${sep}`)) return null;
    const common = resolve(path, gitdir, '..', '..');
    return common.endsWith(`${sep}.git`) ? dirname(common) : common;
  } catch {
    return null;
  }
}

function rowsOf(roots, sizes, min) {
  const kids = new Map();
  for (const path of sizes.keys()) {
    if (roots.includes(path)) continue;
    const parent = dirname(path);
    if (kids.has(parent)) kids.get(parent).push(path);
    else kids.set(parent, [path]);
  }
  const rows = [];
  const visit = (path, level) => {
    const big = [];
    const small = new Map();
    for (const kid of kids.get(path) ?? []) {
      const bytes = sizes.get(kid);
      const worktree = worktreeOf(kid);
      if (bytes >= min) big.push({ path: kid, level, bytes, worktree });
      else if (worktree) {
        if (small.has(worktree)) small.get(worktree).push({ path: kid, bytes });
        else small.set(worktree, [{ path: kid, bytes }]);
      }
    }
    const groups = [...small].map(([repo, members]) => ({ path, level, repo, members, bytes: members.reduce((sum, member) => sum + member.bytes, 0) }));
    for (const row of [...big, ...groups.filter((group) => group.bytes >= min)].sort((a, b) => b.bytes - a.bytes)) {
      rows.push(row);
      if (!row.repo) visit(row.path, level + 1);
    }
  };
  for (const root of roots) {
    rows.push({ path: root, level: 0, bytes: sizes.get(root) });
    visit(root, 1);
  }
  return rows;
}

const pattern = (path) => path.replace(/[*?[\]\\]/gu, '\\$&');

async function writtenWithin(path, minutes, walked) {
  const prune = walked.length > 0 ? ['(', ...walked.flatMap((each, at) => [...(at > 0 ? ['-o'] : []), '-path', pattern(each)]), ')', '-prune', '-o'] : [];
  return (await output('find', [path, '-xdev', ...prune, '-mmin', `-${minutes}`, '-print', '-quit'])).trim() !== '';
}

// A folder's quiet rows were walked a level earlier, so its walk prunes them.
async function markWrites(rows, minutes) {
  for (const level of [...new Set(rows.map((row) => row.level))].sort((a, b) => b - a)) {
    const checks = [];
    for (const row of rows.filter((each) => each.level === level)) {
      if (row.repo) {
        for (const member of row.members) checks.push({ item: member, walked: [] });
        continue;
      }
      const holdsWrittenRow = rows.some((other) => other.level > level && other.written && (other.repo ? other.members.some((member) => inside(member.path, row.path)) : inside(other.path, row.path)));
      if (holdsWrittenRow) {
        row.written = true;
        continue;
      }
      const below = rows.filter((other) => other.level === level + 1 && (other.repo ? other.path === row.path : dirname(other.path) === row.path));
      checks.push({ item: row, walked: below.flatMap((other) => (other.repo ? other.members.map((member) => member.path) : [other.path])) });
    }
    const results = await pool(checks, (check) => writtenWithin(check.item.path, minutes, check.walked));
    checks.forEach((check, at) => {
      check.item.written = results[at];
    });
    for (const row of rows.filter((each) => each.level === level && each.repo)) row.written = row.members.some((member) => member.written);
  }
}

function volumeOf(path) {
  const fields = execFileSync('df', ['-kP', path], { encoding: 'utf8' }).trim().split('\n').at(-1).split(/\s+/u);
  const mount = fields.slice(5).join(' ');
  let snapshots = null;
  try {
    snapshots = execFileSync('tmutil', ['listlocalsnapshots', mount], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split('\n')
      .filter((line) => line.includes('com.apple')).length;
  } catch {}
  return { mount, bytes: Number(fields[1]) * 1024, used: Number(fields[2]) * 1024, free: Number(fields[3]) * 1024, snapshots };
}

const defaultRoots = () => [homedir(), '/private/tmp', tmpdir(), '/Applications'];

export async function diskReport({ roots = defaultRoots(), min = 10 * GB, hours = 24 } = {}) {
  const real = [...new Set(roots.filter((root) => existsSync(root)).map((root) => realpathSync(root)))];
  const tops = real.filter((root) => !real.some((other) => other !== root && inside(root, other)));
  const sizes = await measure(tops, min / 64);
  const rows = rowsOf(tops, sizes, min);
  await markWrites(rows, Math.round(hours * 60));
  return { volume: volumeOf(tops[0] ?? homedir()), hours, rows };
}

const gb = (bytes) => `${(bytes / GB).toFixed(bytes >= 100 * GB ? 0 : 1)}G`;

function render({ volume, hours, rows }) {
  const home = homedir();
  const tilde = (path) => (inside(path, home) ? `~${path.slice(home.length)}` : path);
  const snapshots = volume.snapshots === null ? '' : `, ${volume.snapshots} local snapshots`;
  const lines = [`${volume.mount}: ${gb(volume.bytes)}, ${gb(volume.used)} used, ${gb(volume.free)} free${snapshots}`, '', `${'size'.padStart(7)}  ${`last ${hours}h`.padEnd(10)}  folder`];
  for (const row of rows) {
    const indent = '  '.repeat(row.level);
    if (row.repo) {
      const quiet = row.members.filter((member) => !member.written);
      const label = `${row.members.length} worktrees of ${tilde(row.repo)} in ${tilde(row.path)}, ${quiet.length} quiet (${gb(quiet.reduce((sum, member) => sum + member.bytes, 0))})`;
      lines.push(`${gb(row.bytes).padStart(7)}  ${`${quiet.length}/${row.members.length} quiet`.padEnd(10)}  ${indent}${label}`);
      continue;
    }
    const worktree = row.worktree ? `  (worktree of ${tilde(row.worktree)})` : '';
    lines.push(`${gb(row.bytes).padStart(7)}  ${(row.written ? 'written' : 'quiet').padEnd(10)}  ${indent}${tilde(row.path)}${worktree}`);
  }
  lines.push('', 'du counts each APFS clone and each hard link in full, so rows can add up to more than the used space. Quiet means nothing in it was written, not that nothing reads it.');
  return lines.join('\n');
}

async function main(argv) {
  const values = (flag) => argv.flatMap((arg, at) => (arg === flag ? [argv[at + 1]] : []));
  const roots = values('--root').map((path) => resolve(path));
  const report = await diskReport({ ...(roots.length > 0 ? { roots } : {}), min: Number(values('--min')[0] ?? 10) * GB, hours: Number(values('--hours')[0] ?? 24) });
  console.log(argv.includes('--json') ? JSON.stringify(report, null, 2) : render(report));
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) await main(process.argv.slice(2));
