#!/usr/bin/env node
// Judges the caches package tools keep outside any checkout, and the Docker
// volumes no container uses.
//
//   node machine.mjs [--delete] [--json]
//
// Bun's runtime transpiler cache keeps one file per transpiled source and never
// evicts one, so the files nothing wrote for a week go. An npx install nothing
// wrote for a week and no running process uses goes, and npx installs it again
// when a command needs it. `uv cache prune` runs when uv is installed. An
// anonymous Docker volume no container uses goes, as `docker volume prune`
// judges it. A named one holds a stopped project's data, so it is asked about,
// and so is the pnpm store, which every checkout installs from.
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, realpathSync, rmSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const WEEK = 7 * 86_400_000;

const children = (dir) => {
  try {
    return readdirSync(dir).map((name) => join(dir, name));
  } catch {
    return [];
  }
};

const mtime = (path) => {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return 0;
  }
};

const sizeOf = (paths) => {
  if (paths.length === 0) return 0;
  const out = spawnSync('du', ['-sk', ...paths], { encoding: 'utf8', maxBuffer: 1024 ** 3 }).stdout ?? '';
  return out.split('\n').filter(Boolean).reduce((sum, line) => sum + Number(line.split('\t')[0]) * 1024, 0);
};

const commandLines = () => spawnSync('ps', ['-axo', 'command='], { encoding: 'utf8', maxBuffer: 1024 ** 3 }).stdout ?? '';

export function bunCaches({ home = homedir(), env = process.env } = {}) {
  const set = env.BUN_RUNTIME_TRANSPILER_CACHE_PATH;
  if (set === '0' || set === '') return [];
  const dirs = set ? [set] : [env.XDG_CACHE_HOME && join(env.XDG_CACHE_HOME, 'bun', '@t@'), join(home, 'Library', 'Caches', 'bun', '@t@'), join(home, '.bun', 'install', 'cache', '@t@')];
  return [...new Set(dirs.filter((dir) => dir && existsSync(dir)).map((dir) => realpathSync(dir)))];
}

const quietPiles = (dir, now) => children(dir).filter((path) => path.endsWith('.pile') && now - mtime(path) > WEEK);

const npxDir = ({ home, env }) => join(env.npm_config_cache ?? join(home, '.npm'), '_npx');

// npx writes an install once and never touches it on a later run, so a used
// install can look quiet; the next npx call of that package installs it again.
const quietNpx = (dir, now, running) =>
  children(dir).filter((entry) => {
    const newest = Math.max(...[entry, 'package.json', 'package-lock.json', 'node_modules', 'node_modules/.package-lock.json'].map((name) => mtime(name === entry ? entry : join(entry, name))));
    return now - newest > WEEK && !running.includes(entry);
  });

const docker = (args) => execFileSync('docker', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 120_000 });

const UNITS = { B: 1, kB: 1e3, MB: 1e6, GB: 1e9, TB: 1e12 };
const parseSize = (text) => {
  const match = /^([\d.]+)\s*([kMGT]?B)$/u.exec(text ?? '');
  return match ? Math.round(Number(match[1]) * UNITS[match[2]]) : null;
};

// The named volumes no container uses get one row per compose project, because
// the owner keeps or drops a project's data together.
export function volumeRows(volumes) {
  const rows = [];
  const projects = new Map();
  for (const volume of volumes.filter((each) => each.Links === '0')) {
    const labels = volume.Labels ?? '';
    const bytes = parseSize(volume.Size);
    if (/(^|,)com\.docker\.volume\.anonymous=/u.test(labels)) {
      rows.push({ kind: 'volume', path: `docker volume ${volume.Name}`, names: [volume.Name], verdict: 'safe', reason: 'an anonymous volume no container uses, which docker volume prune removes', bytes });
      continue;
    }
    const project = /com\.docker\.compose\.project=([^,]+)/u.exec(labels)?.[1];
    const key = project ? `docker compose project ${project}` : `docker volume ${volume.Name}`;
    const row = projects.get(key) ?? { kind: 'volume', path: key, names: [], verdict: 'ask', bytes: 0 };
    row.names.push(volume.Name);
    row.bytes += bytes ?? 0;
    row.reason = `${row.names.length === 1 ? 'a named volume' : `${row.names.length} named volumes`} no container uses, which may hold ${project ? 'the project' : 'a project'}'s data: ${row.names.join(' ')}`;
    projects.set(key, row);
  }
  return [...rows, ...projects.values()];
}

function volumeItems() {
  try {
    return volumeRows(JSON.parse(docker(['system', 'df', '-v', '--format', '{{json .Volumes}}'])) ?? []);
  } catch {
    return [];
  }
}

const uvDir = () => {
  const found = spawnSync('uv', ['cache', 'dir'], { encoding: 'utf8' });
  const dir = found.status === 0 ? found.stdout.trim() : '';
  return dir && existsSync(dir) ? dir : null;
};

const pnpmStore = (home) => [join(home, 'Library', 'pnpm', 'store'), join(home, '.local', 'share', 'pnpm', 'store')].find((dir) => existsSync(dir)) ?? null;

export function machineItems({ home = homedir(), env = process.env, now = Date.now(), running = commandLines() } = {}) {
  const items = [];
  for (const dir of bunCaches({ home, env })) {
    const files = quietPiles(dir, now);
    if (files.length > 0) items.push({ kind: 'bun', path: dir, verdict: 'safe', reason: `${files.length} transpiled files nothing wrote for a week; Bun never evicts them`, bytes: files.reduce((sum, file) => sum + statSync(file).size, 0) });
  }
  const npx = npxDir({ home, env });
  const installs = quietNpx(npx, now, running);
  if (installs.length > 0) items.push({ kind: 'npx', path: npx, verdict: 'safe', reason: `${installs.length} npx installs nothing wrote for a week and no running process uses`, bytes: sizeOf(installs) });
  const uv = uvDir();
  if (uv) items.push({ kind: 'uv', path: uv, verdict: 'safe', reason: `uv cache prune removes the entries no package uses, out of ${(sizeOf([uv]) / 1024 ** 3).toFixed(1)}G`, bytes: null });
  const store = pnpmStore(home);
  if (store) items.push({ kind: 'pnpm', path: store, verdict: 'ask', reason: 'the package store every checkout installs from; pnpm store prune removes the files no lockfile of a project pnpm knows names', bytes: sizeOf([store]) });
  items.push(...volumeItems());
  return items;
}

// Each clear judges its files again, so a file written since the scan stays.
export function clearItem(item, { home = homedir(), env = process.env, now = Date.now(), running = commandLines() } = {}) {
  if (item.kind === 'bun') {
    let bytes = 0;
    for (const file of quietPiles(item.path, now)) {
      bytes += statSync(file).size;
      rmSync(file, { force: true });
    }
    item.bytes = bytes;
  } else if (item.kind === 'npx') {
    const installs = quietNpx(npxDir({ home, env }), now, running);
    item.bytes = sizeOf(installs);
    for (const entry of installs) rmSync(entry, { force: true, recursive: true });
  } else if (item.kind === 'uv') {
    const before = sizeOf([item.path]);
    execFileSync('uv', ['cache', 'prune'], { stdio: 'ignore', timeout: 600_000 });
    item.bytes = Math.max(0, before - sizeOf([item.path]));
  } else if (item.kind === 'volume') {
    docker(['volume', 'rm', ...item.names]);
  }
}

const gib = (bytes) => (bytes === null ? '?' : `${(bytes / 1024 ** 3).toFixed(1)}G`);

function render({ items, removed }) {
  const order = { ask: 0, safe: 1 };
  const rows = [...items].sort((a, b) => order[a.verdict] - order[b.verdict] || (b.bytes ?? 0) - (a.bytes ?? 0));
  const lines = rows.map((item) => [item.verdict.toUpperCase().padEnd(4), gib(item.bytes).padStart(7), item.kind.padEnd(8), item.path, item.reason].join('  '));
  const count = (verdict) => items.filter((item) => item.verdict === verdict).length;
  lines.push('', `safe ${count('safe')}, ask ${count('ask')}`);
  if (removed) lines.push(`cleared ${removed.length} items, ${gib(removed.reduce((sum, item) => sum + (item.bytes ?? 0), 0))}`);
  return lines.join('\n');
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const argv = process.argv.slice(2);
  const items = machineItems();
  let removed;
  if (argv.includes('--delete')) {
    removed = [];
    for (const item of items.filter((each) => each.verdict === 'safe')) {
      try {
        clearItem(item);
        removed.push(item);
      } catch (error) {
        Object.assign(item, { verdict: 'ask', reason: `clear failed: ${String(error.message).split('\n')[0]}` });
      }
    }
  }
  console.log(argv.includes('--json') ? JSON.stringify({ items, removed }, null, 2) : render({ items, removed }));
}
