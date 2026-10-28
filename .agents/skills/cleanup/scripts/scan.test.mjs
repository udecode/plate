import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { brief, classifyWorktree, deleteSafe, landed, removeLanded, scan } from './scan.mjs';

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
  const keptCache = join(open, 'apps', 'www', '.next-chip-z');
  mkdirSync(keptCache, { recursive: true });
  age(keptCache, 5);
  const sessions = [
    { cwd: open, isArchived: false, isRunning: true, title: 'still running' },
    { cwd: orphan, isArchived: false, isRunning: false, title: 'open but idle' },
    { cwd: archived, isArchived: true, title: 'done' },
    { cwd: landed, isArchived: true, title: 'landed card' },
    { cwd: unlanded, isArchived: true, title: 'lost work' },
  ];
  return { archived, caches, keptCache, landed, lock, main, open, orphan, root, sessions, unlanded };
}

const verdicts = (items) => Object.fromEntries(items.map((item) => [item.path, item.verdict]));
const verdictOf = (f, path) => scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.find((item) => item.path === path)?.verdict;
const landedOf = (path) => landed({ worktree: path })[0];

test('only folders no open session, process or server uses are marked safe', async () => {
  const f = fixture();
  const server = spawn('tail', ['-f', f.lock], { stdio: 'ignore' });
  await new Promise((done) => setTimeout(done, 300));
  try {
    const now = Date.now();
    const byPath = verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now }).items);
    assert.equal(byPath[f.open], 'keep', 'a worktree a running session uses stays');
    assert.equal(byPath[f.archived], 'safe', 'an archived session whose worktree is clean');
    assert.equal(byPath[f.landed], 'safe', 'an archived session whose changes the checkout already holds');
    assert.equal(byPath[f.unlanded], 'safe', 'an archived session whose patch the checkout has since changed');
    assert.equal(byPath[f.orphan], 'safe', 'a session left open but idle does not keep its worktree');
    assert.equal(byPath[join(f.caches, '.next')], 'keep', 'a build output');
    assert.equal(byPath[join(f.caches, '.next-plite')], 'keep', 'the Plite build output');
    assert.equal(byPath[join(f.caches, '.next-s5')], 'keep', 'a production build used this week');
    assert.equal(byPath[join(f.caches, '.next-3000')], 'keep', 'a port cache used this week');
    assert.equal(byPath[join(f.caches, '.next-3001')], 'keep', 'a cache whose lock a running server holds');
    assert.equal(byPath[join(f.caches, '.next-3002')], 'safe', 'a port cache unused for a week');
    assert.equal(byPath[join(f.caches, '.next-chip-a1')], 'safe', 'a cache named for one session, no server holds it');
    assert.equal(byPath[f.keptCache], 'safe', 'an unused cache inside a worktree the scan keeps');
    const unclaimed = f.sessions.filter((session) => session.cwd !== f.orphan);
    assert.equal(verdicts(scan({ repo: f.main, sessions: unclaimed, sizes: false, now }).items)[f.orphan], 'keep', 'a worktree no session claims that changed today');
    const later = verdicts(scan({ repo: f.main, sessions: unclaimed, sizes: false, now: now + 3 * DAY }).items);
    assert.equal(later[f.orphan], 'safe', 'a worktree no session claims goes once nothing touched it for a day');
    const pinned = f.sessions.map((session) => (session.cwd === f.archived ? { ...session, pinned: true } : session));
    assert.equal(verdicts(scan({ repo: f.main, sessions: pinned, sizes: false, now }).items)[f.archived], 'keep', 'an archived session the owner pinned keeps its worktree');
  } finally {
    server.kill();
  }
});

test('a worktree outside the folders agents use is asked about even when an archived session owned it', () => {
  const facts = { agentMade: false, heldCaches: 0, hoursIdle: 48, invoking: false, locked: null, missing: false, nested: null, processes: 0, repos: 0, scratchHoursQuiet: null, session: { state: null, title: 'done' }, unreached: 0 };
  assert.equal(classifyWorktree(facts)[0], 'ask');
  assert.equal(classifyWorktree({ ...facts, agentMade: true })[0], 'safe');
});

test('a scan run from inside a worktree keeps that worktree and judges the others against the real checkout', () => {
  const f = fixture();
  const items = scan({ repo: f.archived, sessions: f.sessions, sizes: false }).items;
  assert.equal(items.find((item) => item.path === f.archived)?.verdict, 'keep');
  assert.equal(items.find((item) => item.path === f.landed)?.verdict, 'safe');
});

test('--landed asks about a staged version that differs from the worktree file', () => {
  const f = fixture();
  writeFileSync(join(f.archived, 'a.txt'), 'staged only\n');
  git(f.archived, 'add', 'a.txt');
  writeFileSync(join(f.archived, 'a.txt'), 'one\n');
  assert.equal(landedOf(f.archived), 'ask');
});

test('--landed asks about a change the checkout lacks even when its reverse patch applies at other lines', () => {
  const f = fixture();
  writeFileSync(join(f.archived, 'dup.txt'), DUP.replace('OLD', 'NEW'));
  assert.equal(landedOf(f.archived), 'ask');
});

test('--landed passes a change the checkout holds beside another landed patch to the same file', () => {
  const f = fixture();
  const card = DUP.replace('head 0', 'HEAD 0');
  writeFileSync(join(f.archived, 'dup.txt'), card);
  writeFileSync(join(f.main, 'dup.txt'), card.replace('tail 9', 'TAIL 9'));
  assert.equal(landedOf(f.archived), 'safe');
});

test('--landed asks about an ignored file the checkout lacks', () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(f.archived, 'artifacts', 'run', 'proof.log'), 'exit 0\n');
  assert.equal(landedOf(f.archived), 'ask');
});

test('--landed passes ignored copies of the checkout and folders an install or build recreates', () => {
  const f = fixture();
  writeFileSync(join(f.main, '.env.local'), 'KEY=1\n');
  writeFileSync(join(f.archived, '.env.local'), 'KEY=1\n');
  mkdirSync(join(f.archived, 'node_modules', 'pkg'), { recursive: true });
  writeFileSync(join(f.archived, 'node_modules', 'pkg', 'index.js'), '');
  mkdirSync(join(f.archived, 'packages', 'p', 'dist'), { recursive: true });
  writeFileSync(join(f.archived, 'packages', 'p', 'dist', 'index.js'), '');
  assert.equal(landedOf(f.archived), 'safe');
});

function pstackFixture() {
  const f = fixture();
  mkdirSync(join(f.main, '.agents'), { recursive: true });
  writeFileSync(join(f.main, '.agents', 'pstack.json'), '{"plans":"docs/plans"}\n');
  writeFileSync(join(f.main, '.git', 'info', 'exclude'), '.source/\ndocs/plans/artifacts/\n');
  return f;
}

test('--landed in a pstack project passes generated output and asks only about run artifacts the checkout lacks', () => {
  const f = pstackFixture();
  mkdirSync(join(f.archived, 'apps', 'www', '.source'), { recursive: true });
  writeFileSync(join(f.archived, 'apps', 'www', '.source', 'browser.ts'), 'generated\n');
  assert.equal(landedOf(f.archived), 'safe', 'generated output outside the run folders does not keep the worktree');
  mkdirSync(join(f.archived, 'docs', 'plans', 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(f.archived, 'docs', 'plans', 'artifacts', 'run', 'proof.log'), 'exit 0\n');
  assert.equal(landedOf(f.archived), 'ask', 'a run artifact the checkout lacks keeps the worktree');
  mkdirSync(join(f.main, 'docs', 'plans', 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(f.main, 'docs', 'plans', 'artifacts', 'run', 'proof.log'), 'exit 0, merged earlier\n');
  assert.equal(landedOf(f.archived), 'safe', 'the checkout copy a no-overwrite merge kept holds the artifact');
});

test('--landed in a pstack project passes the commits a squash left only in the reflog', () => {
  const f = pstackFixture();
  for (const name of ['b.txt', 'c.txt']) {
    writeFileSync(join(f.archived, name), `${name}\n`);
    git(f.archived, 'add', name);
    git(f.archived, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', name);
  }
  git(f.archived, 'reset', '-q', '--soft', 'HEAD~2');
  git(f.archived, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', 'squashed');
  assert.equal(landedOf(f.archived), 'safe');
});

test('--landed asks about proof logs in a run folder named build', () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts', 'run', 'build'), { recursive: true });
  writeFileSync(join(f.archived, 'artifacts', 'run', 'build', 'mutants-a1.log'), 'caught\n');
  assert.equal(landedOf(f.archived), 'ask');
});

test('--landed asks about a case-only rename the checkout lacks on a case-insensitive disk', () => {
  const f = fixture();
  git(f.archived, 'mv', 'dup.txt', 'Dup.txt');
  assert.equal(landedOf(f.archived), 'ask');
});

test('--landed does not count a checkout copy that resolves into the worktree itself', () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(f.archived, 'artifacts', 'run', 'proof.log'), 'exit 0\n');
  symlinkSync(join(f.archived, 'artifacts'), join(f.main, 'artifacts'));
  assert.equal(landedOf(f.archived), 'ask');
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
    [f.archived, f.landed, f.unlanded, f.orphan, f.keptCache, join(f.caches, '.next-3002'), join(f.caches, '.next-chip-a1')].sort()
  );
  assert.ok(removed.every((item) => item.bytes !== null), 'each removed folder was measured');
  for (const kept of [f.open, join(f.caches, '.next'), join(f.caches, '.next-3000')]) assert.ok(existsSync(kept), `${kept} stays`);
  const listed = execFileSync('git', ['worktree', 'list'], { cwd: f.main, encoding: 'utf8' });
  assert.ok(![f.archived, f.landed, f.unlanded].some((path) => listed.includes(path)), 'git no longer lists the removed worktrees');
  const patchOf = (path) => removed.find((item) => item.path === path).patch;
  assert.equal(patchOf(f.archived), null, 'a clean worktree saves no patch');
  assert.equal(patchOf(f.landed), null, 'a worktree whose changes the checkout holds saves no patch');
  assert.match(readFileSync(patchOf(f.unlanded), 'utf8'), /^\+three$/mu, 'the uncommitted change is saved before the worktree goes');
  git(f.main, 'checkout', '-q', '--', 'a.txt');
  git(f.main, 'apply', '--check', patchOf(f.unlanded));
});

test('a worktree in a session scratch folder stays while that session writes its transcript', () => {
  const f = fixture();
  const id = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
  const proof = join(f.root, id, 'scratchpad', 'wt-proof');
  mkdirSync(dirname(proof), { recursive: true });
  git(f.main, 'worktree', 'add', '-q', '--detach', proof);
  const config = join(f.root, 'claude-config');
  const transcript = join(config, 'projects', '-repo', `${id}.jsonl`);
  mkdirSync(dirname(transcript), { recursive: true });
  writeFileSync(transcript, '{}\n');
  const saved = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = config;
  try {
    const at = (now) => scan({ repo: f.main, sessions: f.sessions, sizes: false, now }).items.find((item) => item.path === proof)?.verdict;
    assert.equal(at(Date.now()), 'keep', 'a session that wrote its transcript today');
    age(transcript, 2);
    assert.equal(at(Date.now() + 3 * DAY), 'safe', 'a session quiet for two days');
  } finally {
    if (saved === undefined) delete process.env.CLAUDE_CONFIG_DIR;
    else process.env.CLAUDE_CONFIG_DIR = saved;
  }
});

test('a worktree whose folder is gone loses only its record', () => {
  const f = fixture();
  renameSync(f.archived, `${f.archived}-moved`);
  assert.equal(verdictOf(f, f.archived), 'safe');
  deleteSafe({ repo: f.main, sessions: f.sessions });
  assert.ok(!execFileSync('git', ['worktree', 'list'], { cwd: f.main, encoding: 'utf8' }).includes(`${f.archived} `), 'git no longer lists it');
  assert.ok(existsSync(`${f.archived}-moved`), 'the moved folder stays');
});

test('the session-start hint counts only folders with no writes for three days that cleanup could remove', () => {
  const f = fixture();
  assert.equal(
    brief({ repo: f.main, now: Date.now() }),
    'cleanup: 0 worktrees and 2 Next cache folders here show no git or cache writes for 3 days; /cleanup removes the ones nothing uses and lists the rest.'
  );
});

test('--remove stops the processes in a landed worktree, saves its uncommitted change and removes it without judging it', async () => {
  const f = fixture();
  const server = spawn('tail', ['-f', '/dev/null'], { cwd: f.open, stdio: 'ignore' });
  await new Promise((done) => setTimeout(done, 300));
  const exited = new Promise((done) => server.on('exit', done));
  writeFileSync(join(f.open, 'a.txt'), 'four\n');
  const [result] = removeLanded({ repo: f.main, worktrees: [f.open] });
  assert.equal(result.removed, true, result.reason);
  assert.equal(result.stopped, 1);
  await exited;
  assert.ok(!existsSync(f.open), 'the folder is gone though a session still claims it and a process worked in it');
  assert.match(readFileSync(result.patch, 'utf8'), /^\+four$/mu, 'the uncommitted change is saved first');
});

test("--remove runs the companion's detach in a worktree that holds its git directory before removing it", () => {
  const f = fixture();
  const saved = join(dirname(f.main), 'detached');
  mkdirSync(join(f.main, '.agents'), { recursive: true });
  writeFileSync(join(f.main, '.agents/pstack.json'), JSON.stringify({ companion: { dir: '.git-private', detach: `cp .git-private ${saved}` } }));
  writeFileSync(join(f.open, '.git-private'), 'gitdir: shared\n');
  const [result] = removeLanded({ repo: f.main, worktrees: [f.open] });
  assert.equal(result.removed, true, result.reason);
  assert.equal(readFileSync(saved, 'utf8'), 'gitdir: shared\n', 'detach ran inside the worktree before it went');
});

test('--remove keeps the checkout, a locked worktree and one outside the agent folders', () => {
  const f = fixture();
  git(f.main, 'worktree', 'lock', '--reason', 'owner keeps it', f.archived);
  const elsewhere = realpathSync(mkdtempSync(join(f.root, 'tmp-')));
  const run = spawnSync(process.execPath, [SCAN, '--repo', f.main, '--remove', f.main, f.archived, f.landed], { encoding: 'utf8', env: { ...process.env, TMPDIR: elsewhere } });
  assert.equal(run.status, 1);
  assert.match(run.stdout, new RegExp(`KEPT  ${f.main}  git does not list it as a linked worktree`));
  assert.match(run.stdout, new RegExp(`KEPT  ${f.archived}  locked: owner keeps it`));
  assert.match(run.stdout, new RegExp(`KEPT  ${f.landed}  it sits outside the folders agents make worktrees in`));
  for (const path of [f.main, f.archived, f.landed]) assert.ok(existsSync(path), `${path} stays`);
});

function commitOnDetachedHead(path) {
  git(path, 'switch', '-q', '--detach');
  writeFileSync(join(path, 'lost.txt'), 'only here\n');
  git(path, 'add', 'lost.txt');
  git(path, 'commit', '-q', '-m', 'made on a detached HEAD');
  return git(path, 'rev-parse', 'HEAD').trim();
}

test('a worktree holding a commit no ref reaches is asked about by the scan and --landed until a branch keeps it', () => {
  const f = fixture();
  const lost = commitOnDetachedHead(f.archived);
  const item = () => scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.find((each) => each.path === f.archived);
  assert.equal(item().verdict, 'ask', 'the commit sits on a detached HEAD');
  assert.match(item().reason, /1 commit that no branch, tag or remote reaches/u);
  git(f.archived, 'switch', '-q', 'archived');
  assert.equal(item().verdict, 'ask', 'only the HEAD history keeps the commit after the switch back');
  assert.equal(landedOf(f.archived), 'ask');
  git(f.main, 'branch', 'saved', lost);
  assert.equal(item().verdict, 'safe', 'a branch now keeps the commit');
  assert.equal(landedOf(f.archived), 'safe');
});

test('the scan removes a worktree whose unreached commits the checkout holds, saving them as a patch', () => {
  const f = fixture();
  commitOnDetachedHead(f.archived);
  git(f.archived, 'switch', '-q', 'archived');
  writeFileSync(join(f.main, 'lost.txt'), 'only here\n');
  git(f.main, 'add', 'lost.txt');
  git(f.main, 'commit', '-q', '-m', 'landed squash');
  const item = deleteSafe({ repo: f.main, sessions: f.sessions }).removed.find((each) => each.path === f.archived);
  assert.ok(item, 'a commit whose change the checkout holds does not keep the worktree');
  assert.match(readFileSync(item.commits, 'utf8'), /^Subject: \[PATCH\] made on a detached HEAD$/mu);
});

test('--remove saves a commit no ref reaches as a patch and removes the landed worktree', () => {
  const f = fixture();
  commitOnDetachedHead(f.archived);
  git(f.archived, 'switch', '-q', 'archived');
  const run = spawnSync(process.execPath, [SCAN, '--repo', f.main, '--remove', f.archived], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout);
  const saved = run.stdout.match(/ {2}commits (\S+)$/mu)?.[1];
  assert.ok(saved, run.stdout);
  assert.ok(!existsSync(f.archived), 'the worktree is gone');
  const patch = readFileSync(saved, 'utf8');
  assert.match(patch, /^Subject: \[PATCH\] made on a detached HEAD$/mu);
  assert.match(patch, /^\+only here$/mu);
});

test('--remove takes only the paths before the next flag', () => {
  const f = fixture();
  const run = spawnSync(process.execPath, [SCAN, '--remove', f.archived, '--repo', f.main], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout);
  assert.equal(run.stdout.trim(), `REMOVED  ${f.archived}`, "the --repo value is not queued for removal");
});
