#!/usr/bin/env node
// Judges each linked worktree of a repository, and each Next.js cache folder
// within four levels of its checkout and of each worktree not marked safe, as
// safe, ask or keep. A build output stays, and its dev and cache folders are
// judged instead.
//
//   node scan.mjs [--repo <checkout> | --repos <folder>] [--sessions <file>] [--json] [--no-sizes] [--delete]
//   node scan.mjs --brief [--repo <checkout>]
//   node scan.mjs --landed <worktree>
//   node scan.mjs [--repo <checkout>] --remove <worktree>...
//
// --sessions takes a JSON array of sessions, each with cwd, isRunning, pinned
// and title. Only a running or pinned session, a running process or a recent
// transcript keeps a worktree; uncommitted changes do not, because a card
// session lands them in the checkout as a patch. A commit that no branch, tag
// or remote reaches, which only the worktree's HEAD history keeps, makes the
// scan ask when it writes a file whose content the checkout's HEAD and its
// upstream both lack and neither changed since, because removing the worktree
// loses it. --delete measures each safe item, judges it again, checks the
// running processes once more, saves a worktree's uncommitted changes the
// checkout lacks and its unreached commits as patches under the git folder's
// cleanup/ and removes it.
// In a pstack project, whose .agents/pstack.json names its plans directory,
// --landed counts only ignored files under <plans>/artifacts/, because there
// every other ignored file is build output or a copy of the checkout's, and
// one there counts as held once the checkout has that path, because the
// landing merge never overwrites the checkout's copy. It also skips commits
// only HEAD's reflog reaches, which land.mjs's squash leaves behind. When its
// config names a `companion` and a worktree holds `companion.dir`, removing
// that worktree first runs `companion.detach` in it, which saves the
// companion repository's uncommitted work there; a failed detach keeps it.
// --repos runs the scan, or --delete, on each checkout directly in a folder
// that has linked worktrees.
// In a pstack project the scan also judges each run folder in
// <plans>/artifacts/, and in any checkout each folder in an ignored .tmp/:
// --delete strips its installs and builds once nothing wrote it for a day and
// deletes it once nothing wrote it for a week, unless the ledger or a decision
// log changed that week names it or a clone in it holds commits no remote has
// or git cannot list its commits.
// Before deleting it, --delete saves each clone's uncommitted changes as a
// patch, as it does for a worktree.
// --brief prints one line, or nothing, counting the unlocked agent worktrees and
// the checkout caches cleanup could remove that show no git or cache writes for
// three days. --landed exits 0 only when every change and ignored file of one
// worktree is committed where a branch, tag or remote reaches it, recreated by
// an install or build, or in the checkout, where a tracked edit also counts
// once the checkout's copy holds its hunks.
// --remove takes worktrees whose work the caller knows landed and judges none of
// them: it stops each process working in one, saves the uncommitted changes the
// checkout lacks as a patch as --delete does, saves each commit no branch, tag
// or remote reaches as a second patch, and removes it. It keeps a worktree git
// does not list, a locked one, one outside the folders agents make worktrees
// in, one holding another worktree, the one it runs in, one that lost its .git
// file while holding files, one whose commits git cannot list, one whose
// processes lsof cannot list and one git refuses to remove, and exits 1 when it
// keeps any.
import { execFileSync, execSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HOUR = 3_600_000;
const WEEK = 7 * 24;
const BUILD_OUTPUT = /^\.next(-plite)?$/u;
const BUILD_PARTS = ['dev', 'cache'];
const PORT_CACHE = /^\.next(-plite)?-\d+$/u;
const CACHE = /^\.next(-|$)/u;
const SKIP_DIRS = new Set(['node_modules', '.git', '.claude', '.turbo']);
const RECREATED = new Set(['node_modules', '.turbo', '.DS_Store']);
const PACKAGE_OUTPUT = new Set(['dist', 'build', 'out', 'coverage', '.cache', '.vite', '.vite-temp', '.swc']);
const IGNORED_LIMIT = 20_000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u;

const git = (cwd, args) =>
  execFileSync('git', ['--no-optional-locks', ...args], {
    cwd,
    encoding: 'utf8',
    maxBuffer: Number.POSITIVE_INFINITY,
    stdio: ['ignore', 'pipe', 'pipe'],
  }).replace(/\n+$/u, '');

const resolves = (cwd, ref) => {
  try {
    git(cwd, ['rev-parse', '--verify', '--quiet', ref]);
    return true;
  } catch {
    return false;
  }
};

const real = (path) => (existsSync(path) ? realpathSync.native(path) : resolve(path));
const within = (path, root) => path === root || path.startsWith(root + sep);
const statOrNull = (path) => {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
};
const newestMtime = (paths) => Math.max(0, ...paths.map(statOrNull).filter(Boolean).map((stat) => stat.mtimeMs));
const entriesOf = (dir) => {
  try {
    return readdirSync(dir).map((name) => join(dir, name));
  } catch {
    return [];
  }
};
// git gc's reflog expire rewrites the logs/HEAD of every worktree at once, so
// the clock reads the time of its newest entry rather than the file's.
function reflogTime(admin) {
  try {
    const last = readFileSync(join(admin, 'logs', 'HEAD'), 'utf8').trimEnd().split('\n').at(-1);
    return Number(/> (\d+) [+-]\d{4}(\t|$)/u.exec(last)?.[1] ?? 0) * 1000;
  } catch {
    return 0;
  }
}
const adminMtime = (admin) => Math.max(newestMtime([join(admin, 'index'), join(admin, 'HEAD')]), reflogTime(admin));
// A symlink, such as a linked node_modules, holds no work, and removal deletes
// only the link.
const holdsFiles = (path) => readdirSync(path, { withFileTypes: true }).some((entry) => entry.isFile() || (entry.isDirectory() && holdsFiles(join(path, entry.name))));
// git marks a worktree prunable once its folder lost the .git link, and a git
// command run there reads whichever repository encloses the folder instead.
const unlinked = (entry) => 'prunable' in entry && existsSync(entry.path);

function cwdProcesses() {
  try {
    const out = execFileSync('lsof', ['-a', '-d', 'cwd', '-Fpn'], { encoding: 'utf8', maxBuffer: Number.POSITIVE_INFINITY, stdio: ['ignore', 'pipe', 'ignore'] });
    const found = [];
    let pid = null;
    for (const line of out.split('\n')) {
      if (line.startsWith('p')) pid = Number(line.slice(1));
      if (line.startsWith('n')) found.push({ pid, cwd: line.slice(1) });
    }
    return found;
  } catch {
    return null;
  }
}

export function processCwds() {
  return cwdProcesses()?.map((each) => each.cwd) ?? null;
}

// lsof exits 1 with nothing on stderr when no process has the file open.
function held(files) {
  for (const file of files.filter(existsSync)) {
    try {
      execFileSync('lsof', ['-t', file], { stdio: ['ignore', 'ignore', 'pipe'] });
      return true;
    } catch (error) {
      if (error.status !== 1 || String(error.stderr ?? '').trim()) return null;
    }
  }
  return false;
}

function usageVerdict(facts) {
  if (facts.locked !== null) return ['keep', `locked: ${facts.locked || 'no reason given'}`];
  if (facts.missing) return ['safe', "its folder is gone, so only git's record of it goes"];
  if (facts.invoking) return ['keep', 'this scan runs in it'];
  if (facts.processes === null) return ['keep', 'lsof could not list the processes working in it'];
  if (facts.processes > 0) return ['keep', `${facts.processes} running processes work in it`];
  if (facts.session?.state) return ['keep', `session "${facts.session.title}" is ${facts.session.state}`];
  if (!facts.session && facts.scratchHoursQuiet !== null && facts.scratchHoursQuiet < 24) return ['keep', 'the session whose scratch folder holds it wrote its transcript in the last day'];
  if (!facts.session && facts.scratchHoursQuiet === null && facts.hoursIdle < 24) return ['keep', 'no session claims it, and it changed in the last day'];
  if (!facts.agentMade) return ['ask', 'it sits outside the folders agents make worktrees in'];
  if (facts.nested) return ['ask', `another worktree lives inside it: ${facts.nested}`];
  if (facts.unlinked) return facts.empty ? ['safe', 'git lost its link to it and it holds no files'] : ['ask', 'git lost its link to it, so the scan cannot read the files in it'];
  return null;
}

const unreachedReason = (count) =>
  count === null ? 'git could not list the commits its HEAD history keeps' : `${count} ${count === 1 ? 'commit' : 'commits'} that no branch, tag or remote reaches, kept only by its HEAD history, with changes the checkout lacks; save them with git branch <name> <sha>`;

function cleanupVerdict(facts) {
  if (facts.heldCaches === null) return ['keep', 'lsof could not tell whether a server holds a cache inside it'];
  if (facts.heldCaches > 0) return ['keep', 'a running server holds a cache inside it'];
  if (facts.repos > 0) return ['ask', `${facts.repos} submodules or nested repositories inside it`];
  if (facts.unreached !== 0) return ['ask', unreachedReason(facts.unreached)];
  return ['safe', facts.session ? 'no session that used it is running' : 'no session has used it for a day'];
}

function landedVerdict(facts) {
  if (facts.heldCaches === null) return ['keep', 'lsof could not tell whether a server holds a cache inside it'];
  if (facts.heldCaches > 0) return ['keep', 'a running server holds a cache inside it'];
  if (facts.repos > 0) return ['ask', `${facts.repos} submodules or nested repositories inside it`];
  if (facts.staged > 0) return ['ask', `${facts.staged} staged changes that differ from its files`];
  if (facts.unlanded > 0) return ['ask', `${facts.unlanded} uncommitted changes the checkout does not hold`];
  if (facts.ignored.overflow) return ['ask', `more than ${IGNORED_LIMIT} ignored files to compare with the checkout`];
  if (facts.ignored.unique.length > 0) return ['ask', `${facts.ignored.unique.length} ignored files the checkout lacks, such as ${facts.ignored.unique[0]}`];
  if (facts.unreached !== 0) return ['ask', unreachedReason(facts.unreached)];
  return ['safe', facts.dirty > 0 ? 'the checkout holds its changes' : 'nothing uncommitted'];
}

export const classifyWorktree = (facts) => usageVerdict(facts) ?? cleanupVerdict(facts);

export function classifyCache(facts) {
  const name = basename(facts.path);
  if (facts.held === null) return ['keep', 'lsof could not tell whether a server holds it'];
  if (facts.held) return ['keep', 'a running server holds its lock'];
  if (isBuildPart(facts.path)) return facts.hoursIdle < 24 ? ['keep', 'used in the last day'] : ['safe', 'next dev or next build recreates it, and nothing used it for a day'];
  if (facts.production && facts.hoursIdle < WEEK) return ['keep', 'a production build used this week, which next start may serve'];
  if (PORT_CACHE.test(name) && facts.hoursIdle < WEEK) return ['keep', 'the next dev server on its port reuses it'];
  if (facts.hoursIdle < 1) return ['keep', 'written in the last hour'];
  return ['safe', 'no server holds it'];
}

function checkoutOf(repo) {
  return real(dirname(git(repo, ['rev-parse', '--path-format=absolute', '--git-common-dir'])));
}

function listWorktrees(main) {
  const entries = [];
  for (const block of git(main, ['worktree', 'list', '--porcelain']).split('\n\n')) {
    const fields = Object.fromEntries(
      block.split('\n').map((line) => {
        const space = line.indexOf(' ');
        return space === -1 ? [line, ''] : [line.slice(0, space), line.slice(space + 1)];
      })
    );
    if (fields.worktree) entries.push({ ...fields, path: real(fields.worktree) });
  }
  return entries.filter((entry) => entry.path !== main);
}

function adminDir(path) {
  const pointer = join(path, '.git');
  if (!existsSync(pointer) || statSync(pointer).isDirectory()) return null;
  const target = readFileSync(pointer, 'utf8').replace(/^gitdir: /u, '').trim();
  return isAbsolute(target) ? target : resolve(path, target);
}

// A case-insensitive disk opens foo.ts for Foo.ts, so presence is read from the
// folder listings, one path part at a time.
function spelledIn(root, rel, listings) {
  let dir = root;
  for (const part of rel.split('/')) {
    if (!listings.has(dir)) {
      try {
        listings.set(dir, new Set(readdirSync(dir)));
      } catch {
        listings.set(dir, new Set());
      }
    }
    if (!listings.get(dir).has(part)) return false;
    dir = join(dir, part);
  }
  return true;
}

function matchesCheckout(main, path, rel, listings) {
  const ours = spelledIn(path, rel, listings);
  const theirs = spelledIn(main, rel, listings);
  if (!ours || !theirs) return !ours && !theirs;
  const a = join(path, rel);
  const b = join(main, rel);
  if (within(real(b), path)) return false;
  const one = lstatSync(a);
  const two = lstatSync(b);
  if (one.isSymbolicLink() || two.isSymbolicLink()) return one.isSymbolicLink() && two.isSymbolicLink() && readlinkSync(a) === readlinkSync(b);
  if (!one.isFile() || !two.isFile()) return false;
  return (one.mode & 0o111) === (two.mode & 0o111) && one.size === two.size && readFileSync(a).equals(readFileSync(b));
}

function statusEntries(path) {
  const fields = git(path, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--ignore-submodules=none']).split('\0');
  const entries = [];
  for (let at = 0; at < fields.length; at++) {
    if (!fields[at]) continue;
    const entry = { x: fields[at][0], y: fields[at][1], file: fields[at].slice(3) };
    if ('RC'.includes(entry.x) || 'RC'.includes(entry.y)) entry.from = fields[++at];
    entries.push(entry);
  }
  return entries;
}

const nestedRepos = (path, entries) => entries.filter((entry) => existsSync(join(path, entry.file, '.git'))).length;

function checkoutHoldsHunks(main, path, entry) {
  if (!/^[ M]{2}$/u.test(entry.x + entry.y) || !statOrNull(join(main, entry.file))?.isFile()) return false;
  const scratch = mkdtempSync(join(tmpdir(), 'cleanup-merge-'));
  try {
    const base = join(scratch, 'base');
    writeFileSync(base, execFileSync('git', ['--no-optional-locks', 'show', `HEAD:${entry.file}`], { cwd: path, maxBuffer: Number.POSITIVE_INFINITY, stdio: ['ignore', 'pipe', 'ignore'] }));
    const ours = join(main, entry.file);
    const merged = execFileSync('git', ['merge-file', '-p', ours, base, join(path, entry.file)], { maxBuffer: Number.POSITIVE_INFINITY, stdio: ['ignore', 'pipe', 'ignore'] });
    return merged.equals(readFileSync(ours));
  } catch {
    return false;
  } finally {
    rmSync(scratch, { force: true, recursive: true });
  }
}

function compareWithCheckout(main, path, listings) {
  const entries = statusEntries(path);
  const repos = nestedRepos(path, entries);
  const staged = entries.filter((entry) => !' ?'.includes(entry.x) && entry.y !== ' ').length;
  const unlanded = entries.filter(
    (entry) =>
      (!matchesCheckout(main, path, entry.file, listings) && !checkoutHoldsHunks(main, path, entry)) ||
      (entry.from && !matchesCheckout(main, path, entry.from, listings))
  ).length;
  return { dirty: entries.length, repos, staged, unlanded };
}

function recreated(path, rel, isDir) {
  const name = basename(rel);
  if (RECREATED.has(name) || name.endsWith('.tsbuildinfo')) return true;
  if (!isDir) return false;
  return CACHE.test(name) || (PACKAGE_OUTPUT.has(name) && existsSync(join(path, dirname(rel), 'package.json')));
}

function runRoot(main) {
  try {
    const { plans } = JSON.parse(readFileSync(join(main, '.agents', 'pstack.json'), 'utf8'));
    return typeof plans === 'string' && plans ? join(plans, 'artifacts') : null;
  } catch {
    return null;
  }
}

function companionOf(main) {
  try {
    return JSON.parse(readFileSync(join(main, '.agents', 'pstack.json'), 'utf8')).companion ?? null;
  } catch {
    return null;
  }
}

function ignoredWork(main, path, listings, root = null) {
  const unique = [];
  let seen = 0;
  const visit = (rel) => {
    if (seen > IGNORED_LIMIT) return;
    if (root && !within(join(path, rel), join(path, root)) && !within(join(path, root), join(path, rel))) return;
    const isDir = Boolean(statOrNull(join(path, rel))?.isDirectory());
    if (recreated(path, rel, isDir)) return;
    if (isDir) {
      for (const name of readdirSync(join(path, rel))) visit(join(rel, name));
      return;
    }
    seen += 1;
    if (root ? !spelledIn(main, rel, listings) : !matchesCheckout(main, path, rel, listings)) unique.push(rel);
  };
  for (const entry of git(path, ['ls-files', '-z', '--others', '--ignored', '--exclude-standard', '--directory']).split('\0')) {
    const rel = entry.replace(/\/$/u, '');
    if (rel) visit(rel);
  }
  return { unique, overflow: seen > IGNORED_LIMIT };
}

function findCaches(root, depth, worktrees) {
  const others = worktrees.map((entry) => entry.path).filter((path) => path !== root);
  const found = [];
  const walk = (dir, left) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const path = join(dir, entry.name);
      if (others.includes(path)) continue;
      if (CACHE.test(entry.name)) {
        if (!others.some((other) => within(other, path))) found.push(path);
      } else if (left > 0 && !SKIP_DIRS.has(entry.name)) walk(path, left - 1);
    }
  };
  walk(root, depth);
  return found;
}

const isBuildPart = (path) => BUILD_PARTS.includes(basename(path)) && BUILD_OUTPUT.test(basename(dirname(path)));

// next start serves a build output's own files, so only its dev and cache
// folders, which Next recreates, can go.
const cacheRows = (path) => (BUILD_OUTPUT.test(basename(path)) ? BUILD_PARTS.map((part) => join(path, part)).filter(existsSync) : [path]);

const cacheLocks = (path) => {
  const owner = isBuildPart(path) ? dirname(path) : path;
  return [join(owner, 'dev', 'lock'), join(owner, 'lock')];
};

function cacheMtime(path) {
  if (!isBuildPart(path)) return newestMtime([path, join(path, 'dev'), join(path, 'BUILD_ID'), ...cacheLocks(path)]);
  // A dev server rewrites its manifests up to two levels down, which leaves
  // the folder's own mtime alone.
  const children = entriesOf(path);
  return newestMtime([path, ...children, ...children.flatMap(entriesOf), join(dirname(path), 'BUILD_ID'), ...cacheLocks(path)]);
}

function cacheFacts(path, now) {
  return { path, held: held(cacheLocks(path)), production: existsSync(join(path, 'BUILD_ID')), hoursIdle: (now - cacheMtime(path)) / HOUR };
}

function sessionFor(path, sessions) {
  const matches = sessions.filter((session) => session.cwd && within(real(session.cwd), path));
  if (matches.length === 0) return null;
  const live = matches.find((session) => session.isRunning || session.pinned);
  const session = live ?? matches[0];
  return { state: live ? (live.isRunning ? 'running' : 'pinned') : null, title: session.title ?? session.sessionId ?? 'untitled' };
}

// A lead's proof worktree sits in its session's scratch folder, whose path
// names that session; its transcript changes while the session runs.
function scratchTranscriptMtime(path, projects) {
  const id = path.split(sep).find((part) => UUID.test(part));
  if (!id) return null;
  const dirs = existsSync(projects) ? readdirSync(projects) : [];
  const transcript = dirs.map((dir) => join(projects, dir, `${id}.jsonl`)).find(existsSync);
  return transcript ? statSync(transcript).mtimeMs : 0;
}

const agentRoots = (main) =>
  [join(main, '.claude', 'worktrees'), join(main, 'docs', 'plans', 'artifacts'), tmpdir(), '/tmp', '/private/tmp'].map(real);

const nestedIn = (path, worktrees) => worktrees.find((other) => other.path !== path && within(other.path, path))?.path ?? null;

function usageFacts(main, entry, context) {
  const { path } = entry;
  const missing = !existsSync(path);
  const admin = missing ? null : adminDir(path);
  const transcript = scratchTranscriptMtime(path, context.projects);
  return {
    locked: 'locked' in entry ? entry.locked : null,
    missing,
    unlinked: unlinked(entry),
    empty: unlinked(entry) && !holdsFiles(path),
    invoking: context.here.some((dir) => within(dir, path)),
    processes: context.cwds === null ? null : context.cwds.filter((cwd) => within(cwd, path)).length,
    session: sessionFor(path, context.sessions),
    scratchHoursQuiet: transcript === null ? null : (context.now - transcript) / HOUR,
    hoursIdle: (context.now - (admin ? adminMtime(admin) : newestMtime([path]))) / HOUR,
    agentMade: agentRoots(main).some((root) => within(path, root)),
    nested: nestedIn(path, context.worktrees),
  };
}

function heldCaches(path, worktrees) {
  const caches = findCaches(path, Number.POSITIVE_INFINITY, worktrees).map((cache) => held(cacheLocks(cache)));
  return caches.includes(null) ? null : caches.filter(Boolean).length;
}

// Removing a worktree deletes its HEAD reflog, so a commit made on a detached
// HEAD and left behind by a later switch or reset is lost unless a ref reaches it.
function unreachedList(main, entry, options, reflog = true) {
  const history = reflog && !unlinked(entry) ? execFileSync('git', ['--no-optional-locks', 'reflog', 'show', '--format=%H', 'HEAD'], { cwd: entry.path, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) : '';
  const tips = [...new Set([entry.HEAD, ...history.split('\n')].filter(Boolean))];
  const input = [...tips, '--not', '--branches', '--tags', '--remotes', ''].join('\n');
  return execFileSync('git', ['--no-optional-locks', 'rev-list', ...options, '--ignore-missing', '--stdin'], { cwd: main, encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'ignore'] });
}

function unreachedCommits(main, entry, reflog = true) {
  try {
    return Number(unreachedList(main, entry, ['--count'], reflog));
  } catch {
    return null;
  }
}

// A squash landing leaves the task's own commits in its worktree's HEAD
// history, so one counts as landed when each file it writes has its content
// in the checkout's HEAD or upstream, or changed there after it.
function unlandedCommits(main, entry, reflog = true) {
  try {
    const commits = unreachedList(main, entry, ['--no-merges'], reflog).split('\n').filter(Boolean);
    if (commits.length === 0) return 0;
    const bases = ['HEAD', '@{upstream}'].filter((ref) => resolves(main, ref));
    const trees = bases.map((ref) => new Map(git(main, ['ls-tree', '-r', '-z', ref]).split('\0').filter(Boolean).map((line) => [line.slice(line.indexOf('\t') + 1), line.split(' ')[2].split('\t')[0]])));
    return commits.filter((sha) => {
      const date = git(main, ['show', '-s', '--format=%cI', sha]).trim();
      const changed = new Set(bases.flatMap((ref) => git(main, ['log', `--since=${date}`, '--name-only', '--format=', ref]).split('\n')));
      const fields = git(main, ['diff-tree', '--no-commit-id', '-r', '-z', '--root', sha]).split('\0');
      for (let at = 0; at + 1 < fields.length; at += 2) {
        const blob = fields[at].split(' ')[3];
        const path = fields[at + 1];
        const content = /^0+$/u.test(blob) ? undefined : blob;
        if (!changed.has(path) && trees.every((tree) => tree.get(path) !== content)) return true;
      }
      return false;
    }).length;
  } catch {
    return null;
  }
}

function saveUnreached(main, entry) {
  const commits = unreachedList(main, entry, ['--reverse', '--topo-order']).split('\n').filter(Boolean);
  if (commits.length === 0) return null;
  const dir = join(git(main, ['rev-parse', '--path-format=absolute', '--git-common-dir']), 'cleanup');
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `${basename(entry.path)}-${Date.now().toString(36)}-commits.patch`);
  writeFileSync(file, commits.map((sha) => git(main, ['format-patch', '-1', '--stdout', '--binary', sha])).join('\n') + '\n');
  return file;
}

const RUN_BUILDS = /^(node_modules|\.turbo|\.next(-.*)?)$/u;

const ignoresTmp = (main) => {
  try {
    git(main, ['check-ignore', '-q', '.tmp/']);
    return true;
  } catch {
    return false;
  }
};

// The run folders sit in the main checkout so they outlive the worktrees that
// write them. The suggested-task ledger beside them names the ones an open
// task still reads, and a decision log changed this week names the ones a new
// row may still cite as proof, which decisions-check requires to exist.
function runFolders(main, now) {
  const root = runRoot(main);
  const roots = [root, ignoresTmp(main) ? '.tmp' : null].filter((each) => each && existsSync(join(main, each)));
  const folders = roots.flatMap((each) => readdirSync(join(main, each), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => join(main, each, entry.name)));
  if (!roots.includes(root)) return { main, folders, cited: '' };
  const dir = join(main, root);
  const ledgers = readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith('.tsv')).map((entry) => join(dir, entry.name));
  const plans = join(main, dirname(root));
  const logs = readdirSync(plans).filter((name) => name.endsWith('.decisions.tsv')).map((name) => join(plans, name)).filter((path) => now - (statOrNull(path)?.mtimeMs ?? 0) < WEEK * HOUR);
  const cited = [...ledgers, ...logs].map((path) => readFileSync(path, 'utf8')).join('\n');
  return { main, folders, cited };
}

// Files only, because removing an install changes its parent folder's mtime.
function runWalk(path) {
  const builds = [];
  const repos = [];
  let newest = statOrNull(path)?.mtimeMs ?? 0;
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const child = join(dir, entry.name);
      if (entry.name === '.git') repos.push(dir);
      if (entry.isDirectory() && RUN_BUILDS.test(entry.name)) builds.push(child);
      else if (entry.isDirectory() && entry.name !== '.git') visit(child);
      else newest = Math.max(newest, statOrNull(child)?.mtimeMs ?? 0);
    }
  };
  visit(path);
  return { builds, newest, repos };
}

function holdReason(repo) {
  try {
    return Number(git(repo, ['rev-list', '--count', '--all', '--not', '--remotes'])) > 0 ? `a clone in it holds commits no remote has: ${repo}` : null;
  } catch {
    return `git cannot list the commits of a clone in it: ${repo}`;
  }
}

function runFacts(path, context, run) {
  const { builds, newest, repos } = runWalk(path);
  return {
    builds,
    cited: run.cited.includes(relative(run.main, path)),
    hoursQuiet: (context.now - newest) / HOUR,
    nested: nestedIn(path, context.worktrees),
    processes: context.cwds === null ? null : context.cwds.filter((cwd) => within(cwd, path)).length,
    held: repos.map(holdReason).filter(Boolean),
    repos,
  };
}

export function classifyRun(facts) {
  const expires = facts.hoursQuiet >= WEEK && !facts.cited;
  if (!expires && facts.builds.length === 0) return null;
  if (facts.nested) return ['keep', `a worktree lives inside it: ${facts.nested}`];
  if (facts.processes === null) return ['keep', 'lsof could not list the processes working in it'];
  if (facts.processes > 0) return ['keep', `${facts.processes} running processes work in it`];
  if (facts.hoursQuiet < 24) return ['keep', 'something wrote it in the last day'];
  const hold = facts.held[0];
  if (expires && !hold) return ['safe', 'nothing wrote it for a week, and neither the ledger nor a decision log changed this week names it', 'expire'];
  if (facts.builds.length > 0) return ['safe', hold ? `its installs and builds go; it stays, because ${hold}` : 'its installs and builds go; its logs stay', 'strip'];
  return ['ask', `nothing wrote it for a week, but ${hold}`];
}

const runBytes = (path, action, builds) => (action === 'strip' ? builds.reduce((sum, build) => sum + (sizeOf(build) ?? 0), 0) : sizeOf(path));

const cleanupFacts = (main, entry, worktrees) => ({ heldCaches: heldCaches(entry.path, worktrees), repos: nestedRepos(entry.path, statusEntries(entry.path)), unreached: unlandedCommits(main, entry) });

function contentFacts(main, entry, worktrees) {
  const listings = new Map();
  const root = runRoot(main);
  return {
    ...compareWithCheckout(main, entry.path, listings),
    heldCaches: heldCaches(entry.path, worktrees),
    ignored: ignoredWork(main, entry.path, listings, root),
    unreached: unlandedCommits(main, entry, root === null),
  };
}

const judgeWorktree = (main, entry, context) => usageVerdict(usageFacts(main, entry, context)) ?? cleanupVerdict(cleanupFacts(main, entry, context.worktrees));

const sizeOf = (path) => {
  try {
    return Number(execFileSync('du', ['-sk', path], { encoding: 'utf8' }).split('\t')[0]) * 1024;
  } catch {
    return null;
  }
};

function contextFor(repo, main, sessions, now) {
  const projects = join(process.env.CLAUDE_CONFIG_DIR ?? join(homedir(), '.claude'), 'projects');
  return { cwds: processCwds(), here: [real(repo), real(process.cwd())], now, projects, sessions, worktrees: listWorktrees(main) };
}

export function scan({ repo, sessions = [], sizes = true, now = Date.now() }) {
  const main = checkoutOf(repo);
  const context = contextFor(repo, main, sessions, now);
  const items = [];
  for (const entry of context.worktrees) {
    const [verdict, reason] = judgeWorktree(main, entry, context);
    items.push({ kind: 'worktree', path: entry.path, verdict, reason, bytes: sizes && existsSync(entry.path) ? sizeOf(entry.path) : null, unlinked: unlinked(entry) });
  }
  const run = runFolders(main, now);
  for (const path of run.folders) {
    const facts = runFacts(path, context, run);
    const verdict = classifyRun(facts);
    if (!verdict) continue;
    const [kept, reason, action] = verdict;
    items.push({ kind: 'run', path, verdict: kept, reason, action, bytes: sizes ? runBytes(path, action, facts.builds) : null });
  }
  const goes = items.filter((item) => item.kind === 'worktree' && item.verdict === 'safe').map((item) => item.path);
  const roots = [main, ...context.worktrees.filter((entry) => existsSync(entry.path) && !goes.includes(entry.path)).map((entry) => entry.path)];
  for (const path of new Set(roots.flatMap((root) => findCaches(root, 3, context.worktrees)).flatMap(cacheRows))) {
    const [verdict, reason] = classifyCache(cacheFacts(path, now));
    items.push({ kind: 'cache', path, verdict, reason, bytes: sizes ? sizeOf(path) : null });
  }
  return { main, items };
}

// A temporary index stages every untracked file without touching the
// worktree's own index, in case its removal then fails.
function savePatch(main, path) {
  const dir = join(git(main, ['rev-parse', '--path-format=absolute', '--git-common-dir']), 'cleanup');
  mkdirSync(dir, { recursive: true });
  const name = join(dir, `${basename(path)}-${Date.now().toString(36)}`);
  const env = { ...process.env, GIT_INDEX_FILE: `${name}.index` };
  const run = (args) => execFileSync('git', ['--no-optional-locks', ...args], { cwd: path, encoding: 'utf8', env, maxBuffer: Number.POSITIVE_INFINITY, stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    if (resolves(path, 'HEAD')) run(['read-tree', 'HEAD']);
    run(['add', '-A']);
    const patch = run(['diff', '--cached', '--binary']);
    if (!patch) return null;
    writeFileSync(`${name}.patch`, patch);
    return `${name}.patch`;
  } finally {
    rmSync(env.GIT_INDEX_FILE, { force: true });
  }
}

// A card's landing patch already holds what the checkout matches, so only a
// worktree with changes the checkout lacks gets a patch.
function removeFolder(main, item) {
  if (item.kind === 'worktree' && existsSync(item.path) && !item.unlinked) item.patch = compareWithCheckout(main, item.path, new Map()).unlanded > 0 ? savePatch(main, item.path) : null;
  // git refuses to remove a folder without its .git link but drops the record of a gone one.
  if (item.unlinked) rmSync(item.path, { force: true, recursive: true });
  if (item.kind === 'worktree') {
    const companion = companionOf(main);
    if (companion?.dir && companion.detach && existsSync(join(item.path, companion.dir))) execSync(companion.detach, { cwd: item.path, stdio: ['ignore', 'pipe', 'pipe'] });
    try {
      git(main, ['worktree', 'remove', '--force', item.path]);
    } catch (error) {
      // git drops the registration even when it fails to delete the folder, so
      // rmSync finishes that folder; a refusal keeps the registration and throws.
      if (listWorktrees(main).some((entry) => entry.path === item.path)) throw error;
    }
  }
  rmSync(item.path, { force: true, recursive: true });
}

const usageNow = (main, entry, context) => usageVerdict(usageFacts(main, entry, { ...context, cwds: processCwds() }));

function rejudgeWorktree(repo, main, sessions, path) {
  const context = contextFor(repo, main, sessions, Date.now());
  const entry = context.worktrees.find((each) => each.path === path);
  if (!entry) return ['ask', 'git no longer lists it'];
  const verdict = judgeWorktree(main, entry, context);
  if (verdict[0] !== 'safe') return verdict;
  return usageNow(main, entry, context) ?? verdict;
}

export function deleteSafe({ repo, sessions = [], now = Date.now() }) {
  const { main, items } = scan({ repo, sessions, sizes: false, now });
  const removed = [];
  const run = runFolders(main, Date.now());
  for (const item of items.filter((each) => each.verdict === 'safe')) {
    if (item.kind === 'run') {
      const facts = runFacts(item.path, contextFor(repo, main, sessions, Date.now()), run);
      const [verdict, reason, action] = classifyRun(facts) ?? ['keep', 'nothing left to remove'];
      if (verdict !== 'safe') {
        Object.assign(item, { verdict, reason: `kept at removal: ${reason}` });
        continue;
      }
      Object.assign(item, { action, reason, bytes: runBytes(item.path, action, facts.builds) });
      try {
        if (action === 'expire') item.patches = facts.repos.map((repo) => savePatch(main, repo)).filter(Boolean);
        for (const path of action === 'strip' ? facts.builds : [item.path]) rmSync(path, { force: true, recursive: true });
      } catch (error) {
        Object.assign(item, { verdict: 'ask', reason: `removal failed: ${String(error.message).split('\n')[0]}` });
        continue;
      }
      removed.push(item);
      continue;
    }
    item.bytes = sizeOf(item.path);
    const [verdict, reason] = item.kind === 'cache' ? classifyCache(cacheFacts(item.path, Date.now())) : rejudgeWorktree(repo, main, sessions, item.path);
    if (verdict !== 'safe') {
      Object.assign(item, { verdict, reason: `kept at removal: ${reason}` });
      continue;
    }
    try {
      if (item.kind === 'worktree' && existsSync(item.path)) item.commits = saveUnreached(main, listWorktrees(main).find((each) => each.path === item.path));
      removeFolder(main, item);
    } catch (error) {
      Object.assign(item, { verdict: 'ask', reason: `removal failed: ${String(error.message).split('\n')[0]}` });
      continue;
    }
    removed.push(item);
  }
  return { main, items, removed };
}

const TERM_GRACE_MS = 5000;
const POLL_MS = 250;
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

function processesIn(path) {
  const found = cwdProcesses();
  return found && [...new Set(found.filter((each) => each.pid !== process.pid && within(real(each.cwd), path)).map((each) => each.pid))];
}

function stopProcesses(pids) {
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM');
    } catch {}
  }
  for (let waited = 0; waited < TERM_GRACE_MS && pids.some(alive); waited += POLL_MS) sleep(POLL_MS);
  for (const pid of pids.filter(alive)) {
    try {
      process.kill(pid, 'SIGKILL');
    } catch {}
  }
}

function removalRefusal(main, listed, path) {
  const entry = listed.find((each) => each.path === path);
  if (!entry) return 'git does not list it as a linked worktree';
  if ('locked' in entry) return `locked: ${entry.locked || 'no reason given'}`;
  if (!agentRoots(main).some((root) => within(path, root))) return 'it sits outside the folders agents make worktrees in';
  const nested = nestedIn(path, listed);
  if (nested) return `another worktree lives inside it: ${nested}`;
  if (within(real(process.cwd()), path)) return 'this command runs in it';
  if (unlinked(entry) && holdsFiles(path)) return 'git lost its link to it, so it cannot save the files in it';
  if (unreachedCommits(main, entry) === null) return unreachedReason(null);
  return null;
}

export function removeLanded({ repo, worktrees }) {
  const main = checkoutOf(repo);
  const listed = listWorktrees(main);
  return worktrees.map((given) => {
    const path = real(given);
    const refusal = removalRefusal(main, listed, path);
    if (refusal) return { path, removed: false, reason: refusal };
    const pids = processesIn(path);
    if (pids === null) return { path, removed: false, reason: 'lsof could not list the processes working in it' };
    stopProcesses(pids);
    const item = { kind: 'worktree', path, unlinked: unlinked(listed.find((each) => each.path === path)) };
    try {
      const commits = saveUnreached(main, listed.find((each) => each.path === path));
      removeFolder(main, item);
      return { path, removed: true, patch: item.patch ?? null, commits, stopped: pids.length };
    } catch (error) {
      return { path, removed: false, reason: `git refused to remove it: ${String(error.stderr ?? error.message).trim()}`, stopped: pids.length };
    }
  });
}

export function landed({ worktree }) {
  const path = real(worktree);
  const main = checkoutOf(path);
  const worktrees = listWorktrees(main);
  const entry = worktrees.find((each) => each.path === path);
  if (!entry) return ['ask', 'git lists no such worktree of the checkout'];
  const nested = nestedIn(path, worktrees);
  if (nested) return ['ask', `another worktree lives inside it: ${nested}`];
  return landedVerdict(contentFacts(main, entry, worktrees));
}

// A folder that is itself a linked worktree holds a .git file, not a folder.
export function checkoutsIn(dir) {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && statOrNull(join(dir, entry.name, '.git'))?.isDirectory())
    .map((entry) => real(join(dir, entry.name)))
    .filter((main) => {
      try {
        return listWorktrees(main).length > 0;
      } catch {
        return false;
      }
    });
}

export function brief({ repo, now = Date.now(), days = 3 }) {
  const main = checkoutOf(repo);
  const stale = (mtime) => now - mtime > days * 24 * HOUR;
  const roots = agentRoots(main);
  const worktrees = listWorktrees(main);
  const idle = worktrees.filter((entry) => {
    const admin = !('locked' in entry) && existsSync(entry.path) && roots.some((root) => within(entry.path, root)) ? adminDir(entry.path) : null;
    return admin && stale(adminMtime(admin));
  }).length;
  const caches = findCaches(main, 3, worktrees).flatMap(cacheRows).filter((path) => {
    const mtime = cacheMtime(path);
    return stale(mtime) && classifyCache({ path, held: false, production: existsSync(join(path, 'BUILD_ID')), hoursIdle: (now - mtime) / HOUR })[0] === 'safe';
  }).length;
  if (idle + caches === 0) return '';
  return `cleanup: ${idle} worktrees and ${caches} Next cache folders here show no git or cache writes for ${days} days; /cleanup removes the ones nothing uses and lists the rest.`;
}

const gib = (bytes) => (bytes === null ? '?' : `${(bytes / 1024 ** 3).toFixed(1)}G`);

function render({ items, removed }) {
  const order = { ask: 0, keep: 2, safe: 1 };
  const rows = [...items].sort((a, b) => order[a.verdict] - order[b.verdict] || (b.bytes ?? 0) - (a.bytes ?? 0));
  const lines = rows.map((item) => [item.verdict.toUpperCase().padEnd(4), gib(item.bytes).padStart(7), item.kind.padEnd(8), item.path, item.reason].join('  '));
  const outermost = items.filter((item) => !items.some((other) => other !== item && other.bytes !== null && within(item.path, other.path)));
  const total = (verdict) => {
    const group = items.filter((item) => item.verdict === verdict);
    const sized = outermost.filter((item) => item.verdict === verdict && item.bytes !== null);
    return sized.length === 0 ? `${group.length}` : `${group.length} (${gib(sized.reduce((sum, item) => sum + item.bytes, 0))})`;
  };
  lines.push('', `safe ${total('safe')}, ask ${total('ask')}, keep ${total('keep')}`);
  if (removed) lines.push(`removed ${removed.length} items, ${gib(removed.reduce((sum, item) => sum + (item.bytes ?? 0), 0))} by du, which counts shared hard links and APFS clones again`);
  const patches = (removed ?? []).filter((item) => item.patch);
  if (patches.length > 0) lines.push(`saved the uncommitted changes of ${patches.length} worktrees as patches in ${dirname(patches[0].patch)}`);
  const clones = (removed ?? []).flatMap((item) => item.patches ?? []);
  if (clones.length > 0) lines.push(`saved the uncommitted changes of ${clones.length} clones as patches in ${dirname(clones[0])}`);
  const commits = (removed ?? []).filter((item) => item.commits);
  if (commits.length > 0) lines.push(`saved the unreached commits of ${commits.length} worktrees as patches in ${dirname(commits[0].commits)}`);
  return lines.join('\n');
}

function main(argv) {
  const value = (flag) => {
    const at = argv.indexOf(flag);
    return at === -1 ? undefined : argv[at + 1];
  };
  if (argv.includes('--landed')) {
    const [verdict, reason] = landed({ worktree: resolve(value('--landed')) });
    console.log(`${verdict.toUpperCase()}  ${reason}`);
    return verdict === 'safe' ? 0 : 1;
  }
  const repo = resolve(value('--repo') ?? process.cwd());
  if (argv.includes('--remove')) {
    const after = argv.slice(argv.indexOf('--remove') + 1);
    const flag = after.findIndex((arg) => arg.startsWith('--'));
    const paths = flag === -1 ? after : after.slice(0, flag);
    const results = removeLanded({ repo, worktrees: paths });
    for (const result of results) {
      const stopped = result.stopped ? `  stopped ${result.stopped} process${result.stopped === 1 ? '' : 'es'}` : '';
      console.log(result.removed ? `REMOVED  ${result.path}${result.patch ? `  patch ${result.patch}` : ''}${result.commits ? `  commits ${result.commits}` : ''}${stopped}` : `KEPT  ${result.path}  ${result.reason}${stopped}`);
    }
    return results.every((result) => result.removed) ? 0 : 1;
  }
  if (argv.includes('--brief')) {
    const line = brief({ repo });
    if (line) console.log(line);
    return 0;
  }
  const sessionsFile = value('--sessions');
  const sessions = sessionsFile ? JSON.parse(readFileSync(sessionsFile, 'utf8')) : [];
  const many = argv.includes('--repos');
  const results = (many ? checkoutsIn(resolve(value('--repos'))) : [repo]).map((each) =>
    argv.includes('--delete') ? deleteSafe({ repo: each, sessions }) : scan({ repo: each, sessions, sizes: !argv.includes('--no-sizes') })
  );
  if (argv.includes('--json')) console.log(JSON.stringify(many ? results : results[0], null, 2));
  else console.log(results.map((result) => (many ? `## ${result.main}\n${render(result)}` : render(result))).join('\n\n'));
  return 0;
}

// exitCode instead of exit, so a long report piped elsewhere finishes writing.
if (process.argv[1] && real(process.argv[1]) === real(fileURLToPath(import.meta.url))) {
  process.exitCode = main(process.argv.slice(2));
}
