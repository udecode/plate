import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, realpathSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { brief, classifyWorktree, deleteSafe, scan } from './scan.mjs';

const DAY = 86_400_000;
const SCAN = join(dirname(fileURLToPath(import.meta.url)), 'scan.mjs');
const BLOCK = (word) => `a\nb\nc\n${word}\nd\ne\nf\n`;
const FILLER = (tag) => Array.from({ length: 10 }, (_, n) => `${tag} ${n}\n`).join('');
const DUP = `${FILLER('head')}${BLOCK('OLD')}${FILLER('middle')}${BLOCK('NEW')}${FILLER('tail')}`;

const git = (cwd, ...args) => execFileSync('git', ['-c', 'protocol.file.allow=always', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function age(path, days) {
  const old = new Date(Date.now() - days * DAY);
  utimesSync(path, old, old);
}

function fixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'cleanup-scan-')));
  const main = join(root, 'main');
  mkdirSync(main);
  git(main, 'init', '-q', '-b', 'next');
  git(main, 'config', 'user.email', 't@example.com');
  git(main, 'config', 'user.name', 't');
  writeFileSync(join(main, 'a.txt'), 'one\n');
  writeFileSync(join(main, 'dup.txt'), DUP);
  writeFileSync(join(main, '.gitignore'), '.next*\nartifacts/\nnode_modules/\n.env.local\ndist/\n');
  mkdirSync(join(main, 'packages', 'p'), { recursive: true });
  writeFileSync(join(main, 'packages', 'p', 'package.json'), '{}\n');
  git(main, 'add', '-A');
  git(main, 'commit', '-q', '-m', 'base');
  const worktree = (name) => {
    const path = join(root, name);
    git(main, 'worktree', 'add', '-q', '-b', name, path);
    return path;
  };
  const open = worktree('open');
  const archived = worktree('archived');
  const landed = worktree('landed');
  writeFileSync(join(landed, 'a.txt'), 'two\n');
  writeFileSync(join(landed, 'new.txt'), 'new\n');
  writeFileSync(join(main, 'a.txt'), 'two\n');
  writeFileSync(join(main, 'new.txt'), 'new\n');
  const unlanded = worktree('unlanded');
  writeFileSync(join(unlanded, 'a.txt'), 'three\n');
  const orphan = worktree('orphan');
  const caches = join(main, 'apps', 'www');
  const ages = { '.next': 5, '.next-plite': 5, '.next-3000': 5, '.next-3001': 5, '.next-3002': 10, '.next-chip-a1': 5, '.next-s5': 3 };
  const lock = join(caches, '.next-3001', 'dev', 'lock');
  for (const [name, days] of Object.entries(ages)) {
    const dev = join(caches, name, 'dev');
    mkdirSync(dev, { recursive: true });
    if (name === '.next-3001') writeFileSync(lock, '');
    if (name === '.next-s5') writeFileSync(join(caches, name, 'BUILD_ID'), 'b\n');
    for (const path of [lock, join(caches, name, 'BUILD_ID'), dev, join(caches, name)]) if (existsSync(path)) age(path, days);
  }
  const keptCache = join(unlanded, 'apps', 'www', '.next-chip-z');
  mkdirSync(keptCache, { recursive: true });
  age(keptCache, 5);
  const sessions = [
    { cwd: open, isArchived: false, title: 'still open' },
    { cwd: archived, isArchived: true, title: 'done' },
    { cwd: landed, isArchived: true, title: 'landed card' },
    { cwd: unlanded, isArchived: true, title: 'lost work' },
  ];
  return { archived, caches, keptCache, landed, lock, main, open, orphan, root, sessions, unlanded };
}

const verdicts = (items) => Object.fromEntries(items.map((item) => [item.path, item.verdict]));
const verdictOf = (f, path) => scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.find((item) => item.path === path)?.verdict;

test('only folders nothing uses and whose changes are safe are marked safe', async () => {
  const f = fixture();
  const server = spawn('tail', ['-f', f.lock], { stdio: 'ignore' });
  await new Promise((done) => setTimeout(done, 300));
  try {
    const now = Date.now();
    const byPath = verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now }).items);
    assert.equal(byPath[f.open], 'keep', 'a worktree an open session uses stays');
    assert.equal(byPath[f.archived], 'safe', 'an archived session whose worktree is clean');
    assert.equal(byPath[f.landed], 'safe', 'an archived session whose changes the checkout already holds');
    assert.equal(byPath[f.unlanded], 'ask', 'uncommitted changes the checkout does not hold');
    assert.equal(byPath[f.orphan], 'keep', 'a worktree no session claims that changed today');
    assert.equal(byPath[join(f.caches, '.next')], 'keep', 'a build output');
    assert.equal(byPath[join(f.caches, '.next-plite')], 'keep', 'the Plite build output');
    assert.equal(byPath[join(f.caches, '.next-s5')], 'keep', 'a production build used this week');
    assert.equal(byPath[join(f.caches, '.next-3000')], 'keep', 'a port cache used this week');
    assert.equal(byPath[join(f.caches, '.next-3001')], 'keep', 'a cache whose lock a running server holds');
    assert.equal(byPath[join(f.caches, '.next-3002')], 'safe', 'a port cache unused for a week');
    assert.equal(byPath[join(f.caches, '.next-chip-a1')], 'safe', 'a cache named for one session, no server holds it');
    assert.equal(byPath[f.keptCache], 'safe', 'an unused cache inside a worktree the scan keeps');
    const later = verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now: now + 3 * DAY }).items);
    assert.equal(later[f.orphan], 'ask', 'a worktree no session claims is asked about once it is a day old');
  } finally {
    server.kill();
  }
});

test('a worktree outside the folders agents use is asked about even when an archived session owned it', () => {
  const facts = { agentMade: false, dirty: 0, heldCaches: 0, hoursIdle: 48, ignored: { overflow: false, unique: [] }, invoking: false, locked: null, missing: false, nested: null, processes: 0, reachable: true, repos: 0, session: { open: false, title: 'done' }, staged: 0, unlanded: 0 };
  assert.equal(classifyWorktree(facts)[0], 'ask');
  assert.equal(classifyWorktree({ ...facts, agentMade: true })[0], 'safe');
});

test('a scan run from inside a worktree keeps that worktree and judges the others against the real checkout', () => {
  const f = fixture();
  const items = scan({ repo: f.archived, sessions: f.sessions, sizes: false }).items;
  assert.equal(items.find((item) => item.path === f.archived)?.verdict, 'keep');
  assert.equal(items.find((item) => item.path === f.landed)?.verdict, 'safe');
});

test('a staged version that differs from the worktree file is asked about', () => {
  const f = fixture();
  writeFileSync(join(f.archived, 'a.txt'), 'staged only\n');
  git(f.archived, 'add', 'a.txt');
  writeFileSync(join(f.archived, 'a.txt'), 'one\n');
  assert.equal(verdictOf(f, f.archived), 'ask');
});

test('a change the checkout lacks is asked about even when its reverse patch applies at other lines', () => {
  const f = fixture();
  writeFileSync(join(f.archived, 'dup.txt'), DUP.replace('OLD', 'NEW'));
  assert.equal(verdictOf(f, f.archived), 'ask');
});

test('an ignored file the checkout lacks is asked about', () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(f.archived, 'artifacts', 'run', 'proof.log'), 'exit 0\n');
  assert.equal(verdictOf(f, f.archived), 'ask');
});

test('ignored copies of the checkout and folders an install or build recreates do not keep a worktree', () => {
  const f = fixture();
  writeFileSync(join(f.main, '.env.local'), 'KEY=1\n');
  writeFileSync(join(f.archived, '.env.local'), 'KEY=1\n');
  mkdirSync(join(f.archived, 'node_modules', 'pkg'), { recursive: true });
  writeFileSync(join(f.archived, 'node_modules', 'pkg', 'index.js'), '');
  mkdirSync(join(f.archived, 'packages', 'p', 'dist'), { recursive: true });
  writeFileSync(join(f.archived, 'packages', 'p', 'dist', 'index.js'), '');
  assert.equal(verdictOf(f, f.archived), 'safe');
});

test('proof logs in a run folder named build are asked about', () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts', 'run', 'build'), { recursive: true });
  writeFileSync(join(f.archived, 'artifacts', 'run', 'build', 'mutants-a1.log'), 'caught\n');
  assert.equal(verdictOf(f, f.archived), 'ask');
});

test('a case-only rename the checkout lacks is asked about on a case-insensitive disk', () => {
  const f = fixture();
  git(f.archived, 'mv', 'dup.txt', 'Dup.txt');
  assert.equal(verdictOf(f, f.archived), 'ask');
});

test('a checkout copy that resolves into the worktree itself does not count', () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(f.archived, 'artifacts', 'run', 'proof.log'), 'exit 0\n');
  symlinkSync(join(f.archived, 'artifacts'), join(f.main, 'artifacts'));
  assert.equal(verdictOf(f, f.archived), 'ask');
});

test('a submodule with uncommitted work inside it is asked about', () => {
  const f = fixture();
  const lib = join(f.root, 'lib');
  mkdirSync(lib);
  git(lib, 'init', '-q', '-b', 'main');
  writeFileSync(join(lib, 'x.txt'), 'x\n');
  git(lib, 'add', 'x.txt');
  git(lib, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', 'x');
  git(f.archived, 'submodule', 'add', '-q', lib, 'sub');
  git(f.archived, 'commit', '-q', '-m', 'add sub');
  writeFileSync(join(f.archived, 'sub', 'x.txt'), 'changed inside the submodule\n');
  assert.equal(verdictOf(f, f.archived), 'ask');
});

test('a worktree that holds another registered worktree is asked about', () => {
  const f = fixture();
  git(f.main, 'worktree', 'add', '-q', '--detach', join(f.archived, 'artifacts', 'inner'));
  assert.equal(verdictOf(f, f.archived), 'ask');
});

test('a registered worktree named like a cache is never listed as a cache', () => {
  const f = fixture();
  const child = join(f.unlanded, 'apps', 'www', '.next-review');
  git(f.main, 'worktree', 'add', '-q', '--detach', child);
  for (const path of [child, join(child, '.git')]) age(path, 5);
  const rows = scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.filter((item) => item.path === child);
  assert.deepEqual(rows.map((item) => item.kind), ['worktree']);
});

test('a server holding a cache deep inside a worktree keeps it', async () => {
  const f = fixture();
  const deep = join(f.archived, 'l1', 'l2', 'l3', 'l4', '.next-deep', 'dev');
  mkdirSync(deep, { recursive: true });
  writeFileSync(join(deep, 'lock'), '');
  const server = spawn('tail', ['-f', join(deep, 'lock')], { cwd: f.root, stdio: 'ignore' });
  await new Promise((done) => setTimeout(done, 300));
  try {
    assert.equal(verdictOf(f, f.archived), 'keep');
  } finally {
    server.kill();
  }
});

test('--landed passes for a worktree whose changes the checkout holds and fails for one with a unique ignored file', () => {
  const f = fixture();
  assert.equal(spawnSync(process.execPath, [SCAN, '--landed', f.landed]).status, 0);
  writeFileSync(join(f.landed, '.env.local'), 'ONLY_HERE=1\n');
  assert.equal(spawnSync(process.execPath, [SCAN, '--landed', f.landed]).status, 1);
});

test('a worktree a running process works in is neither marked safe nor deleted', async () => {
  const f = fixture();
  const shell = spawn('tail', ['-f', '/dev/null'], { cwd: f.archived, stdio: 'ignore' });
  await new Promise((done) => setTimeout(done, 300));
  try {
    assert.equal(verdictOf(f, f.archived), 'keep');
    deleteSafe({ repo: f.main, sessions: f.sessions });
    assert.ok(existsSync(f.archived), 'the worktree stays');
  } finally {
    shell.kill();
  }
});

test('delete removes the safe set and leaves every other folder', () => {
  const f = fixture();
  const { removed } = deleteSafe({ repo: f.main, sessions: f.sessions });
  assert.deepEqual(
    removed.map((item) => item.path).sort(),
    [f.archived, f.landed, f.keptCache, join(f.caches, '.next-3002'), join(f.caches, '.next-chip-a1')].sort()
  );
  assert.ok(removed.every((item) => item.bytes !== null), 'each removed folder was measured');
  for (const kept of [f.open, f.unlanded, f.orphan, join(f.caches, '.next'), join(f.caches, '.next-3000')]) assert.ok(existsSync(kept), `${kept} stays`);
  const listed = execFileSync('git', ['worktree', 'list'], { cwd: f.main, encoding: 'utf8' });
  assert.ok(!listed.includes(f.archived) && !listed.includes(f.landed), 'git no longer lists the removed worktrees');
});

test('the session-start hint counts only folders with no writes for three days that cleanup could remove', () => {
  const f = fixture();
  assert.equal(
    brief({ repo: f.main, now: Date.now() }),
    'cleanup: 0 worktrees and 2 Next cache folders here show no git or cache writes for 3 days; /cleanup removes the ones nothing uses and lists the rest.'
  );
});
