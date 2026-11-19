import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { zstdCompressSync } from 'node:zlib';

import { autoCleanup, brief, classifyWorktree, deleteSafe, landed, removeLanded, scan } from './scan.mjs';

Object.assign(process.env, { CODEX_HOME: mkdtempSync(join(tmpdir(), 'cleanup-codex-')), GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' });

// lsof walks every process on the machine, which took most of this file's run time on a busy
// host. A stand-in on PATH reports that no process works in or holds anything, and the tests that
// start a process call realLsof to reach the real one.
const LSOF = execFileSync('sh', ['-c', 'command -v lsof'], { encoding: 'utf8' }).trim();
const BIN = mkdtempSync(join(tmpdir(), 'cleanup-bin-'));
writeFileSync(join(BIN, 'lsof'), `#!/bin/sh\n[ -n "$CLEANUP_REAL_LSOF" ] && exec '${LSOF}' "$@"\ncase " $* " in *" cwd "*) exit 0 ;; esac\nexit 1\n`, { mode: 0o755 });
process.env.PATH = `${BIN}:${process.env.PATH}`;
const realLsof = (t) => {
  process.env.CLEANUP_REAL_LSOF = '1';
  t.after(() => delete process.env.CLEANUP_REAL_LSOF);
};

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
  const ages = { '.next': 5, '.next-plite': 5, '.next-3000': 5, '.next-3001': 5, '.next-chip-a1': 5, '.next-s5': 3 };
  const lock = join(caches, '.next-3001', 'dev', 'lock');
  for (const [name, days] of Object.entries(ages)) {
    const dev = join(caches, name, 'dev');
    mkdirSync(dev, { recursive: true });
    if (name === '.next-3001') writeFileSync(lock, '');
    if (name === '.next-s5') writeFileSync(join(caches, name, 'BUILD_ID'), 'b\n');
    for (const path of [lock, join(caches, name, 'BUILD_ID'), dev, join(caches, name)]) if (existsSync(path)) age(path, days);
  }
  const buildLock = join(caches, '.next', 'dev', 'lock');
  writeFileSync(buildLock, '');
  const manifest = join(caches, '.next-plite', 'dev', 'server', 'app-paths-manifest.json');
  mkdirSync(dirname(manifest));
  writeFileSync(manifest, '{}\n');
  for (const path of [join(caches, '.next', 'cache'), join(caches, '.next', 'server'), join(caches, '.next-plite', 'cache')]) mkdirSync(path);
  for (const path of [buildLock, join(caches, '.next', 'dev'), join(caches, '.next', 'cache'), dirname(manifest), join(caches, '.next-plite', 'dev'), join(caches, '.next-plite', 'cache')]) age(path, 5);
  const keptCache = join(open, 'apps', 'www', '.next-chip-z');
  mkdirSync(keptCache, { recursive: true });
  age(keptCache, 5);
  const keptPort = join(open, 'apps', 'www', '.next-3002');
  mkdirSync(keptPort);
  age(keptPort, 5);
  const sessions = [
    { cwd: open, isArchived: false, isRunning: true, title: 'still running' },
    { cwd: orphan, isArchived: false, isRunning: false, title: 'open but idle' },
    { cwd: archived, isArchived: true, title: 'done' },
    { cwd: landed, isArchived: true, title: 'landed card' },
    { cwd: unlanded, isArchived: true, title: 'lost work' },
  ];
  return { archived, buildLock, caches, keptCache, keptPort, landed, lock, main, open, orphan, root, sessions, unlanded };
}

const verdicts = (items) => Object.fromEntries(items.map((item) => [item.path, item.verdict]));
const verdictOf = (f, path) => scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.find((item) => item.path === path)?.verdict;
const landedOf = (path) => landed({ worktree: path })[0];

test('only folders no open session, process or server uses are marked safe', async (t) => {
  realLsof(t);
  const f = fixture();
  const server = spawn('tail', ['-f', f.lock, f.buildLock], { stdio: 'ignore' });
  await new Promise((done) => setTimeout(done, 300));
  try {
    const now = Date.now();
    const byPath = verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now }).items);
    assert.equal(byPath[f.open], 'keep', 'a worktree a running session uses stays');
    assert.equal(byPath[f.archived], 'safe', 'an archived session whose worktree is clean');
    assert.equal(byPath[f.landed], 'safe', 'an archived session whose changes the checkout already holds');
    assert.equal(byPath[f.unlanded], 'safe', 'an archived session whose patch the checkout has since changed');
    assert.equal(byPath[f.orphan], 'keep', 'a session left open but idle keeps its worktree for a day');
    assert.equal(verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now: now + 2 * DAY }).items)[f.orphan], 'safe', 'and not after a quiet day');
    assert.equal(byPath[join(f.caches, '.next', 'dev')], 'keep', "a build output's dev folder whose lock a running server holds");
    assert.equal(byPath[join(f.caches, '.next', 'cache')], 'keep', 'the build cache beside a running dev server');
    assert.equal(byPath[join(f.caches, '.next-plite', 'dev')], 'keep', 'a dev folder whose manifests changed today');
    assert.equal(byPath[join(f.caches, '.next-plite', 'cache')], 'safe', 'a build cache no server holds and nothing used for a day');
    assert.equal(byPath[join(f.caches, '.next-s5')], 'keep', 'a production build used this week');
    assert.equal(byPath[join(f.caches, '.next-3000')], 'keep', "a port folder in the main checkout used this week, whose cache next dev reads back");
    assert.equal(byPath[f.keptPort], 'safe', 'a port folder in a worktree that no server holds');
    assert.equal(byPath[join(f.caches, '.next-3001')], 'keep', 'a cache whose lock a running server holds');
    assert.equal(byPath[join(f.caches, '.next-chip-a1')], 'safe', 'a cache named for one session, no server holds it');
    assert.equal(byPath[f.keptCache], 'safe', 'an unused cache inside a worktree the scan keeps');
    const unclaimed = f.sessions.filter((session) => session.cwd !== f.orphan);
    assert.equal(verdicts(scan({ repo: f.main, sessions: unclaimed, sizes: false, now }).items)[f.orphan], 'keep', 'a worktree no session claims that changed today');
    const later = verdicts(scan({ repo: f.main, sessions: unclaimed, sizes: false, now: now + 3 * DAY }).items);
    assert.equal(later[f.orphan], 'safe', 'a worktree no session claims goes once nothing touched it for a day');
    assert.equal(later[join(f.caches, '.next-3000')], 'safe', "a port folder in the main checkout goes after a quiet week");
    const pinned = f.sessions.map((session) => (session.cwd === f.archived ? { ...session, pinned: true } : session));
    assert.equal(verdicts(scan({ repo: f.main, sessions: pinned, sizes: false, now }).items)[f.archived], 'keep', 'an archived session the owner pinned keeps its worktree');
  } finally {
    server.kill();
  }
});

function quietGit(path, days) {
  const admin = git(path, 'rev-parse', '--absolute-git-dir').trim();
  const log = join(admin, 'logs', 'HEAD');
  const old = Math.floor((Date.now() - days * DAY) / 1000);
  writeFileSync(log, readFileSync(log, 'utf8').replace(/> \d+ /gu, `> ${old} `));
  for (const file of ['index', 'HEAD']) age(join(admin, file), days);
}

test('a gc that rewrites every reflog today does not reset a worktree idle for days', () => {
  const f = fixture();
  quietGit(f.orphan, 3);
  const unclaimed = f.sessions.filter((session) => session.cwd !== f.orphan);
  assert.equal(verdictOf({ ...f, sessions: unclaimed }, f.orphan), 'safe');
});

test('a file written in the last day keeps a worktree no session claims, however old its git history', () => {
  const f = fixture();
  quietGit(f.orphan, 3);
  mkdirSync(join(f.orphan, 'artifacts'));
  const proof = join(f.orphan, 'artifacts', 'proof.log');
  writeFileSync(proof, 'written just now\n');
  const unclaimed = { ...f, sessions: f.sessions.filter((session) => session.cwd !== f.orphan) };
  assert.equal(verdictOf(unclaimed, f.orphan), 'keep');
  age(proof, 3);
  assert.equal(verdictOf(unclaimed, f.orphan), 'safe');
});

test('--repos judges each checkout in a folder that has linked worktrees', () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'cleanup-repos-')));
  for (const name of ['with', 'without']) {
    mkdirSync(join(root, name));
    git(join(root, name), 'init', '-q', '-b', 'next');
    git(join(root, name), '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'base');
  }
  git(join(root, 'with'), 'worktree', 'add', '-q', '-b', 'w', join(root, 'with-w'));
  mkdirSync(join(root, 'plain'));
  const out = execFileSync('node', [SCAN, '--repos', root, '--no-sizes'], { cwd: root, encoding: 'utf8' });
  assert.ok(out.includes(`## ${join(root, 'with')}\n`), out);
  assert.ok(out.includes(join(root, 'with-w')), out);
  assert.ok(!out.includes(join(root, 'without')), out);
});

test('a worktree outside the folders agents use is asked about even when an archived session owned it', () => {
  const facts = { agentMade: false, codex: 0, heldCaches: 0, hoursQuiet: 48, ignored: { overflow: false, unique: [] }, invoking: false, locked: null, missing: false, nested: null, processes: 0, repos: 0, session: { state: null, title: 'done' }, unreached: 0 };
  assert.equal(classifyWorktree(facts)[0], 'ask');
  assert.equal(classifyWorktree({ ...facts, agentMade: true })[0], 'safe');
});

test('a quiet worktree on a codex/ branch beside the checkout is safe, and one on another branch is asked about', () => {
  const f = fixture();
  const codex = join(f.root, 'ellie-codex-lane');
  git(f.main, 'worktree', 'add', '-q', '-b', 'codex/lane', codex);
  quietGit(codex, 3);
  quietGit(f.orphan, 3);
  const elsewhere = realpathSync(mkdtempSync(join(f.root, 'tmp-')));
  const run = spawnSync(process.execPath, [SCAN, '--repo', f.main, '--no-sizes'], { encoding: 'utf8', env: { ...process.env, TMPDIR: elsewhere } });
  assert.match(run.stdout, new RegExp(`SAFE .*${codex} `), run.stdout);
  assert.match(run.stdout, new RegExp(`ASK .*${f.orphan}  it sits outside the folders agents make worktrees in`), run.stdout);
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

function ageTree(path, days) {
  if (statSync(path).isDirectory()) for (const name of readdirSync(path)) ageTree(join(path, name), days);
  age(path, days);
}

test('run folders lose their installs and builds after a quiet day and go after a quiet week unless the ledger or a decision log changed this week names them', () => {
  const f = pstackFixture();
  const runs = join(f.main, 'docs', 'plans', 'artifacts');
  const run = (name, days) => {
    mkdirSync(join(runs, name, 'export', 'node_modules', 'dep'), { recursive: true });
    mkdirSync(join(runs, name, 'export', '.next', 'cache'), { recursive: true });
    writeFileSync(join(runs, name, 'proof.log'), 'exit 0\n');
    writeFileSync(join(runs, name, 'export', 'node_modules', 'dep', 'index.js'), '\n');
    ageTree(join(runs, name), days);
    return join(runs, name);
  };
  const old = run('old', 10);
  const cited = run('cited', 10);
  const active = run('active', 10);
  const stale = run('stale', 10);
  const quiet = run('quiet', 3);
  const fresh = run('fresh', 0);
  writeFileSync(join(runs, 'suggested-tasks.decisions.tsv'), 'chip\tt1\tproof: docs/plans/artifacts/cited/proof.log\t\toffered\n');
  writeFileSync(join(f.main, 'docs', 'plans', 'active.decisions.tsv'), 'build\tx\ty\tproof: docs/plans/artifacts/active/proof.log\tpartial\n');
  writeFileSync(join(f.main, 'docs', 'plans', 'stale.decisions.tsv'), 'build\tx\ty\tproof: docs/plans/artifacts/stale/proof.log\tpartial\n');
  age(join(f.main, 'docs', 'plans', 'stale.decisions.tsv'), 10);
  const byPath = Object.fromEntries(scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.filter((item) => item.kind === 'run').map((item) => [item.path, `${item.verdict} ${item.action ?? ''}`.trim()]));
  assert.deepEqual(byPath, { [old]: 'safe expire', [stale]: 'safe expire', [cited]: 'safe strip', [active]: 'safe strip', [quiet]: 'safe strip', [fresh]: 'keep' });
  deleteSafe({ repo: f.main, sessions: f.sessions });
  assert.ok(!existsSync(old), 'a run folder quiet for a week goes');
  for (const kept of [cited, active, quiet]) {
    assert.ok(existsSync(join(kept, 'proof.log')), 'a stripped run folder keeps its logs');
    assert.ok(!existsSync(join(kept, 'export', 'node_modules')) && !existsSync(join(kept, 'export', '.next')), 'a stripped run folder loses its installs and builds');
  }
  assert.ok(existsSync(join(fresh, 'export', 'node_modules')), 'a run folder written today keeps everything');
  assert.ok(existsSync(join(runs, 'suggested-tasks.decisions.tsv')), 'the ledger stays');
});

test('scratch copies in an ignored .tmp go after a quiet week, saving uncommitted changes, unless a clone in them holds commits no remote has or git cannot read it', () => {
  const f = fixture();
  const tmp = join(f.main, '.tmp');
  const commit = (repo, name) => {
    writeFileSync(join(repo, name), `${name}\n`);
    git(repo, 'add', name);
    git(repo, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', name);
  };
  mkdirSync(join(tmp, 'copy', 'node_modules', 'dep'), { recursive: true });
  writeFileSync(join(tmp, 'copy', 'result.json'), '{}\n');
  git(tmp, 'clone', '-q', f.main, 'synced');
  writeFileSync(join(tmp, 'synced', 'a.txt'), 'edited\n');
  git(tmp, 'clone', '-q', f.main, 'ahead');
  commit(join(tmp, 'ahead'), 'b.txt');
  git(tmp, 'clone', '-q', f.main, 'stashed');
  writeFileSync(join(tmp, 'stashed', 'a.txt'), 'shelved\n');
  git(join(tmp, 'stashed'), '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'stash', '-q');
  mkdirSync(join(tmp, 'scratch'));
  git(join(tmp, 'scratch'), 'init', '-q');
  commit(join(tmp, 'scratch'), 'c.txt');
  mkdirSync(join(tmp, 'unborn'));
  git(join(tmp, 'unborn'), 'init', '-q');
  writeFileSync(join(tmp, 'unborn', 'd.txt'), 'draft\n');
  git(f.main, 'worktree', 'add', '-q', '--detach', join(tmp, 'dropped'));
  rmSync(readFileSync(join(tmp, 'dropped', '.git'), 'utf8').replace('gitdir: ', '').trim(), { recursive: true });
  ageTree(tmp, 10);
  const runs = () => Object.fromEntries(scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.filter((item) => item.kind === 'run').map((item) => [item.path, `${item.verdict} ${item.action ?? ''}`.trim()]));
  assert.deepEqual(runs(), {}, 'a .tmp git does not ignore is left alone');
  writeFileSync(join(f.main, '.git', 'info', 'exclude'), '.tmp/\n');
  assert.deepEqual(runs(), { [join(tmp, 'copy')]: 'safe expire', [join(tmp, 'synced')]: 'safe expire', [join(tmp, 'ahead')]: 'ask', [join(tmp, 'stashed')]: 'ask', [join(tmp, 'scratch')]: 'ask', [join(tmp, 'unborn')]: 'safe expire', [join(tmp, 'dropped')]: 'ask' });
  const { removed } = deleteSafe({ repo: f.main, sessions: f.sessions });
  assert.ok(!existsSync(join(tmp, 'copy')) && !existsSync(join(tmp, 'synced')), 'quiet copies go');
  const [patch] = removed.find((item) => item.path === join(tmp, 'synced')).patches;
  assert.match(readFileSync(patch, 'utf8'), /^\+edited$/mu, "the clone's uncommitted change is saved before it goes");
  const [draft] = removed.find((item) => item.path === join(tmp, 'unborn')).patches;
  assert.match(readFileSync(draft, 'utf8'), /^\+draft$/mu, 'a clone with no commit yet goes with its files saved');
  assert.ok(existsSync(join(tmp, 'ahead', 'b.txt')) && existsSync(join(tmp, 'scratch', 'c.txt')), 'a clone with commits no remote has stays, a remoteless one included');
  assert.ok(existsSync(join(tmp, 'dropped', 'a.txt')), 'a worktree copy whose repository dropped it stays');
});

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

test('a server holding a cache deep inside a worktree keeps it', async (t) => {
  realLsof(t);
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

test('--delete copies the ignored files the checkout lacks or holds with other content before it removes a worktree, in a pstack project only run artifacts', () => {
  const f = fixture();
  writeFileSync(join(f.archived, '.env.local'), 'ONLY_HERE=1\n');
  const item = deleteSafe({ repo: f.main, sessions: f.sessions }).removed.find((each) => each.path === f.archived);
  assert.ok(item, 'an ignored file the checkout lacks does not keep the worktree');
  assert.equal(readFileSync(join(item.saved, 'ignored', '.env.local'), 'utf8'), 'ONLY_HERE=1\n');
  const p = pstackFixture();
  mkdirSync(join(p.archived, 'apps', 'www', '.source'), { recursive: true });
  writeFileSync(join(p.archived, 'apps', 'www', '.source', 'browser.ts'), 'generated\n');
  mkdirSync(join(p.archived, 'docs', 'plans', 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(p.archived, 'docs', 'plans', 'artifacts', 'run', 'proof.log'), 'exit 0\n');
  writeFileSync(join(p.archived, 'docs', 'plans', 'artifacts', 'run', 'page.html'), 'worktree render\n');
  mkdirSync(join(p.main, 'docs', 'plans', 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(p.main, 'docs', 'plans', 'artifacts', 'run', 'page.html'), 'checkout render\n');
  const folder = deleteSafe({ repo: p.main, sessions: p.sessions }).removed.find((each) => each.path === p.archived)?.saved;
  assert.ok(folder, 'a run artifact the checkout lacks does not keep the worktree');
  const saved = join(folder, 'ignored');
  assert.equal(readFileSync(join(saved, 'docs', 'plans', 'artifacts', 'run', 'proof.log'), 'utf8'), 'exit 0\n');
  assert.equal(readFileSync(join(saved, 'docs', 'plans', 'artifacts', 'run', 'page.html'), 'utf8'), 'worktree render\n', 'a run artifact the checkout holds with other content');
  assert.ok(!existsSync(join(saved, 'apps')), 'generated output outside the run folders is not copied');
});

test('--delete saves a staged version that differs from the file on disk', () => {
  const f = fixture();
  writeFileSync(join(f.archived, 'a.txt'), 'draft\n');
  git(f.archived, 'add', 'a.txt');
  writeFileSync(join(f.archived, 'a.txt'), 'one\n');
  const item = deleteSafe({ repo: f.main, sessions: f.sessions }).removed.find((each) => each.path === f.archived);
  assert.ok(item?.saved, 'the worktree goes with a save');
  assert.match(readFileSync(join(item.saved, 'staged.patch'), 'utf8'), /^\+draft$/mu);
});

test('--delete removes a worktree with a FIFO among its ignored files and copies the rest', () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts'));
  execFileSync('mkfifo', [join(f.archived, 'artifacts', 'pipe')]);
  writeFileSync(join(f.archived, 'artifacts', 'proof.log'), 'exit 0\n');
  const item = deleteSafe({ repo: f.main, sessions: f.sessions }).removed.find((each) => each.path === f.archived);
  assert.ok(item, 'a FIFO holds no content to save');
  assert.equal(readFileSync(join(item.saved, 'ignored', 'artifacts', 'proof.log'), 'utf8'), 'exit 0\n');
});

test('--delete keeps a worktree whose save fails and leaves no part of the save behind', { skip: process.getuid?.() === 0 && 'root reads a file whose mode hides it' }, () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts'));
  for (const name of ['a.log', 'b.log', 'c.log']) writeFileSync(join(f.archived, 'artifacts', name), `${name}\n`);
  const locked = join(f.archived, 'artifacts', 'b.log');
  chmodSync(locked, 0);
  try {
    const item = deleteSafe({ repo: f.main, sessions: f.sessions }).items.find((each) => each.path === f.archived);
    assert.match(item.reason, /^removal failed: /u);
    assert.ok(existsSync(locked), 'the worktree stays');
    const cleanup = join(f.main, '.git', 'cleanup');
    assert.deepEqual(readdirSync(cleanup).filter((name) => name.startsWith('archived-')), [], 'the failed save is gone');
  } finally {
    chmodSync(locked, 0o644);
  }
});

test('two worktrees with the same folder name saved in the same millisecond keep separate saves', () => {
  const f = fixture();
  const paths = ['x', 'y'].map((parent) => {
    const path = join(f.root, parent, 'proof');
    git(f.main, 'worktree', 'add', '-q', '-b', `proof-${parent}`, path);
    mkdirSync(join(path, 'artifacts'));
    writeFileSync(join(path, 'artifacts', 'p.log'), `${parent}\n`);
    return path;
  });
  const sessions = [...f.sessions, ...paths.map((cwd) => ({ cwd, isArchived: true, title: 'done' }))];
  const clock = Date.now;
  // A millisecond clock can floor below a write it follows, which reads as a write during the save.
  const at = clock() + 1000;
  Date.now = () => at;
  let removed;
  try {
    ({ removed } = deleteSafe({ repo: f.main, sessions }));
  } finally {
    Date.now = clock;
  }
  for (const [path, parent] of [[paths[0], 'x'], [paths[1], 'y']]) {
    const saved = removed.find((each) => each.path === path)?.saved;
    assert.ok(saved, `the ${parent} worktree goes with a save of its own`);
    assert.equal(readFileSync(join(saved, 'ignored', 'artifacts', 'p.log'), 'utf8'), `${parent}\n`);
  }
});

test('--delete saves a file git add -f tracks although an ignore rule matches it', () => {
  const f = fixture();
  mkdirSync(join(f.archived, 'artifacts'));
  writeFileSync(join(f.archived, 'artifacts', 'proof.log'), 'proof\n');
  git(f.archived, 'add', '-f', 'artifacts/proof.log');
  const item = deleteSafe({ repo: f.main, sessions: f.sessions }).removed.find((each) => each.path === f.archived);
  assert.ok(item?.saved, 'the worktree goes with a save');
  assert.match(readFileSync(join(item.saved, 'changes.patch'), 'utf8'), /^\+proof$/mu);
});

test('an unresolved merge is asked about and --remove keeps it, because a patch cannot save its index stages', () => {
  const f = fixture();
  git(f.archived, 'switch', '-q', '-c', 'theirs');
  writeFileSync(join(f.archived, 'a.txt'), 'theirs\n');
  git(f.archived, 'commit', '-q', '-am', 'theirs');
  git(f.archived, 'switch', '-q', 'archived');
  writeFileSync(join(f.archived, 'a.txt'), 'mine\n');
  git(f.archived, 'commit', '-q', '-am', 'mine');
  assert.equal(spawnSync('git', ['merge', '-q', 'theirs'], { cwd: f.archived }).status, 1, 'the merge stops on a conflict');
  assert.equal(verdictOf(f, f.archived), 'ask');
  const [result] = removeLanded({ repo: f.main, worktrees: [f.archived] });
  assert.equal(result.removed, false);
  assert.match(result.reason, /unresolved merge/u);
  assert.ok(existsSync(f.archived), 'the worktree stays');
});

test('--delete drops the temporary refs and partial saves a run that died left more than a day ago', () => {
  const f = fixture();
  const head = git(f.main, 'rev-parse', 'HEAD').trim();
  const name = (at) => `proof-${at.toString(36)}-abcdef`;
  const [stale, fresh] = [name(Date.now() - 2 * DAY), name(Date.now())];
  const cleanup = join(f.main, '.git', 'cleanup');
  for (const each of [stale, fresh]) {
    git(f.main, 'update-ref', `refs/cleanup/${each}/1`, head);
    mkdirSync(join(cleanup, `${each}.partial`), { recursive: true });
  }
  deleteSafe({ repo: f.main, sessions: f.sessions });
  assert.equal(git(f.main, 'for-each-ref', '--format=%(refname)', 'refs/cleanup/').trim(), `refs/cleanup/${fresh}/1`, 'a ref a running save may still hold stays');
  assert.deepEqual(readdirSync(cleanup).filter((each) => each.endsWith('.partial')), [`${fresh}.partial`], 'a partial save a running save may still write stays');
});

test('--delete deletes each save a week after it was written and keeps the run report', () => {
  const f = fixture();
  const cleanup = join(f.main, '.git', 'cleanup');
  const [folder, patch, recent, report] = ['old-worktree-mvbdgkzl-abcdef', 'old-clone-mvbdgkzl.patch', 'recent-clone.patch', 'last-run'].map((name) => join(cleanup, name));
  mkdirSync(folder, { recursive: true });
  writeFileSync(join(folder, 'changes.patch'), 'x\n');
  for (const path of [patch, recent, report]) writeFileSync(path, 'x\n');
  for (const path of [folder, patch, report]) age(path, 8);
  age(recent, 6);
  deleteSafe({ repo: f.main, sessions: f.sessions });
  assert.ok(!existsSync(folder), 'a save folder goes a week after it was written');
  assert.ok(!existsSync(patch), 'a patch an older scan wrote goes too');
  assert.ok(existsSync(recent), 'a save written within the week stays');
  assert.ok(existsSync(report), 'the daily run report stays');
});

test('a worktree a running process works in is neither marked safe nor deleted', async (t) => {
  realLsof(t);
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
    [f.archived, f.landed, f.unlanded, f.keptCache, f.keptPort, join(f.caches, '.next-chip-a1'), join(f.caches, '.next', 'cache'), join(f.caches, '.next-plite', 'cache')].sort()
  );
  assert.ok(removed.every((item) => item.bytes !== null), 'each removed folder was measured');
  for (const kept of [f.open, f.orphan, join(f.caches, '.next', 'server'), join(f.caches, '.next', 'dev'), join(f.caches, '.next-3000'), join(f.caches, '.next-3001'), join(f.caches, '.next-plite', 'dev')]) assert.ok(existsSync(kept), `${kept} stays`);
  const listed = execFileSync('git', ['worktree', 'list'], { cwd: f.main, encoding: 'utf8' });
  assert.ok(![f.archived, f.landed, f.unlanded].some((path) => listed.includes(path)), 'git no longer lists the removed worktrees');
  const savedOf = (path) => removed.find((item) => item.path === path).saved;
  assert.equal(savedOf(f.archived), undefined, 'a clean worktree saves nothing');
  assert.equal(savedOf(f.landed), undefined, 'a worktree whose changes the checkout holds saves nothing');
  assert.match(readFileSync(join(savedOf(f.unlanded), 'worktree'), 'utf8'), /^branch refs\/heads\/unlanded$/mu, 'the save names the branch it came from');
  const patch = join(savedOf(f.unlanded), 'changes.patch');
  assert.match(readFileSync(patch, 'utf8'), /^\+three$/mu, 'the uncommitted change is saved before the worktree goes');
  git(f.main, 'checkout', '-q', '--', 'a.txt');
  git(f.main, 'apply', '--check', patch);
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

test('a worktree stays a day after a session working in it last wrote its transcript', () => {
  const f = fixture();
  const config = join(f.root, 'claude-config');
  const transcript = join(config, 'projects', f.orphan.replace(/[^a-zA-Z0-9]/gu, '-'), 'session.jsonl');
  mkdirSync(dirname(transcript), { recursive: true });
  writeFileSync(transcript, '{}\n');
  const later = Date.now() + 2 * DAY;
  const saved = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = config;
  try {
    const at = (now) => verdicts(scan({ repo: f.main, sizes: false, now }).items)[f.orphan];
    utimesSync(transcript, new Date(later - 3_600_000), new Date(later - 3_600_000));
    assert.equal(at(later), 'keep', 'a transcript written an hour ago');
    age(transcript, 0);
    assert.equal(at(later), 'safe', 'a transcript quiet for two days');
  } finally {
    if (saved === undefined) delete process.env.CLAUDE_CONFIG_DIR;
    else process.env.CLAUDE_CONFIG_DIR = saved;
  }
});

test('a worktree stays a day after a Codex chat working in it last wrote its rollout, compressed or not', () => {
  const f = fixture();
  const day = join(process.env.CODEX_HOME, 'sessions', '2026', '11', '15');
  mkdirSync(day, { recursive: true });
  const meta = `${JSON.stringify({ type: 'session_meta', payload: { cwd: join(f.orphan, 'apps') } })}\n{}\n`;
  const later = Date.now() + 2 * DAY;
  const at = () => verdicts(scan({ repo: f.main, sizes: false, now: later }).items)[f.orphan];
  const write = (name, bytes) => {
    const path = join(day, name);
    writeFileSync(path, bytes);
    utimesSync(path, new Date(later - 3_600_000), new Date(later - 3_600_000));
    return path;
  };
  try {
    assert.equal(at(), 'safe', 'no Codex chat');
    const plain = write('rollout-a.jsonl', meta);
    assert.equal(at(), 'keep', 'a rollout written an hour ago');
    age(plain, 0);
    assert.equal(at(), 'safe', 'a rollout quiet for two days');
    const packed = write('rollout-b.jsonl.zst', zstdCompressSync(meta));
    assert.equal(at(), 'keep', 'a compressed rollout written an hour ago');
    rmSync(packed);
    write('rollout-c.jsonl.zst', zstdCompressSync(meta).subarray(0, 8));
    assert.equal(at(), 'keep', 'a recent rollout the scan cannot read');
  } finally {
    rmSync(join(process.env.CODEX_HOME, 'sessions'), { force: true, recursive: true });
  }
});

test('the session-start cleanup starts once a day unless the models sheet turns it off', () => {
  const f = fixture();
  const config = join(f.root, 'claude-config');
  mkdirSync(config);
  const saved = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = config;
  const started = [];
  const start = (repo, stamp) => started.push([repo, stamp]);
  try {
    const now = Date.now();
    const stamp = autoCleanup({ repo: f.orphan, now, start });
    assert.equal(stamp, join(f.main, '.git', 'cleanup', 'last-run'));
    assert.deepEqual(started, [[f.orphan, stamp]], 'it runs from the session worktree, so the run keeps that one');
    assert.equal(autoCleanup({ repo: f.main, now, start }), null, 'a second session that day starts none');
    age(stamp, 2);
    writeFileSync(join(config, 'pstack-models.md'), 'default effort: high\nauto cleanup: off\n');
    assert.equal(autoCleanup({ repo: f.main, now, start }), null, 'the user turned it off');
    writeFileSync(join(config, 'pstack-models.md'), 'auto cleanup: on\n');
    assert.equal(autoCleanup({ repo: f.main, now, start }), stamp, 'a day later it starts again');
    assert.equal(started.length, 2);
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

test('a worktree that lost its .git link goes when it holds no files and is asked about otherwise', () => {
  const f = fixture();
  rmSync(f.archived, { recursive: true });
  mkdirSync(join(f.archived, 'packages', 'p'), { recursive: true });
  symlinkSync(f.main, join(f.archived, 'node_modules'));
  rmSync(join(f.landed, '.git'));
  assert.equal(verdictOf(f, f.archived), 'safe');
  assert.equal(verdictOf(f, f.landed), 'ask');
  deleteSafe({ repo: f.main, sessions: f.sessions });
  assert.ok(!git(f.main, 'worktree', 'list').includes(`${f.archived} `), 'git no longer lists the empty one');
  assert.ok(!existsSync(f.archived), 'its empty folder is gone');
  assert.ok(existsSync(join(f.main, 'a.txt')), 'the symlink target stays');
  assert.ok(existsSync(join(f.landed, 'a.txt')), 'the one holding files stays');
});

test('--remove keeps a worktree that lost its .git link while it holds files', () => {
  const f = fixture();
  rmSync(f.archived, { recursive: true });
  mkdirSync(f.archived);
  rmSync(join(f.orphan, '.git'));
  const [kept, removed] = removeLanded({ repo: f.main, worktrees: [f.orphan, f.archived] });
  assert.equal(kept.removed, false);
  assert.match(kept.reason, /lost its link/u);
  assert.equal(removed.removed, true, removed.reason);
  assert.ok(!existsSync(f.archived), 'the empty folder is gone');
  assert.ok(!git(f.main, 'worktree', 'list').includes(`${f.archived} `), 'git no longer lists it');
});

test('the session-start hint counts only folders with no writes for three days that cleanup could remove', () => {
  const f = fixture();
  assert.equal(
    brief({ repo: f.main, now: Date.now() }),
    'cleanup: 0 worktrees and 3 Next cache folders here show no git or cache writes for 3 days; /cleanup removes the ones nothing uses and lists the rest.'
  );
});

test('--remove stops the processes in a landed worktree, saves its uncommitted change and removes it without judging it', async (t) => {
  realLsof(t);
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
  assert.match(readFileSync(join(result.saved, 'changes.patch'), 'utf8'), /^\+four$/mu, 'the uncommitted change is saved first');
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

function unbundle(root, bundle) {
  const fresh = mkdtempSync(join(root, 'fresh-'));
  git(fresh, 'init', '-q');
  git(fresh, 'fetch', '-q', bundle, 'refs/cleanup/*:refs/restored/*');
  const tip = git(fresh, 'for-each-ref', '--format=%(objectname)', 'refs/restored').trim().split('\n')[0];
  return { tip, show: (rev) => git(fresh, 'show', rev) };
}

test('--landed asks about a commit no ref reaches until a branch keeps it, and --delete bundles it, merges included, before removing the worktree', () => {
  const f = fixture();
  const lost = commitOnDetachedHead(f.archived);
  git(f.archived, 'switch', '-q', '-c', 'side', 'next');
  writeFileSync(join(f.archived, 'side.txt'), 'side\n');
  git(f.archived, 'add', 'side.txt');
  git(f.archived, 'commit', '-q', '-m', 'side');
  git(f.archived, 'switch', '-q', '--detach', lost);
  git(f.archived, 'merge', '-q', '--no-ff', '--no-commit', 'side');
  writeFileSync(join(f.archived, 'resolution.txt'), 'only in the merge\n');
  git(f.archived, 'add', 'resolution.txt');
  git(f.archived, 'commit', '-q', '-m', 'merge side');
  const merge = git(f.archived, 'rev-parse', 'HEAD').trim();
  git(f.archived, 'switch', '-q', 'archived');
  assert.equal(landedOf(f.archived), 'ask', 'only the HEAD history keeps the merge after the switch back');
  git(f.main, 'branch', 'saved', merge);
  assert.equal(landedOf(f.archived), 'safe', 'a branch now keeps it');
  git(f.main, 'branch', '-D', '-q', 'saved');
  const item = deleteSafe({ repo: f.main, sessions: f.sessions }).removed.find((each) => each.path === f.archived);
  assert.ok(item?.saved, 'a commit the checkout lacks does not keep the worktree');
  const restored = unbundle(f.root, join(item.saved, 'commits.bundle'));
  assert.equal(restored.tip, merge, 'the bundle keeps the merge itself');
  assert.equal(restored.show(`${merge}:resolution.txt`), 'only in the merge\n');
});

test('a bundle holds the commits under it that only a pull-request branch reached, so pruning that branch loses nothing', () => {
  const f = fixture();
  const remote = join(f.root, 'remote.git');
  git(f.root, 'init', '-q', '--bare', '-b', 'next', remote);
  git(f.main, 'remote', 'add', 'origin', remote);
  git(f.main, 'push', '-q', 'origin', 'next');
  git(f.main, 'remote', 'set-head', 'origin', 'next');
  git(f.archived, 'switch', '-q', '-c', 'pr');
  writeFileSync(join(f.archived, 'pr.txt'), 'pull request\n');
  git(f.archived, 'add', 'pr.txt');
  git(f.archived, 'commit', '-q', '-m', 'pull request');
  git(f.archived, 'push', '-q', 'origin', 'pr');
  const lost = commitOnDetachedHead(f.archived);
  git(f.archived, 'switch', '-q', 'archived');
  git(f.main, 'branch', '-D', '-q', 'pr');
  const item = deleteSafe({ repo: f.main, sessions: f.sessions }).removed.find((each) => each.path === f.archived);
  assert.ok(item?.saved, 'a commit on a pull-request branch does not keep the worktree');
  git(f.main, 'push', '-q', 'origin', '--delete', 'pr');
  git(f.main, 'reflog', 'expire', '--expire=now', '--expire-unreachable=now', '--all');
  git(f.main, 'gc', '-q', '--prune=now');
  git(f.main, 'fetch', '-q', join(item.saved, 'commits.bundle'), 'refs/cleanup/*:refs/restored/*');
  assert.equal(git(f.main, 'show', `${lost}:pr.txt`), 'pull request\n');
});

test("a worktree whose folder is gone has its unreached commits bundled from git's record before the record goes", () => {
  const f = fixture();
  const lost = commitOnDetachedHead(f.archived);
  git(f.archived, 'switch', '-q', 'archived');
  renameSync(f.archived, `${f.archived}-moved`);
  const item = deleteSafe({ repo: f.main, sessions: f.sessions }).removed.find((each) => each.path === f.archived);
  assert.ok(item?.saved, 'the record goes with a save');
  assert.equal(unbundle(f.root, join(item.saved, 'commits.bundle')).show(`${lost}:lost.txt`), 'only here\n');
});

test('--landed passes a worktree whose unreached commits the checkout holds', () => {
  const f = fixture();
  commitOnDetachedHead(f.archived);
  git(f.archived, 'switch', '-q', 'archived');
  writeFileSync(join(f.main, 'lost.txt'), 'only here\n');
  git(f.main, 'add', 'lost.txt');
  git(f.main, 'commit', '-q', '-m', 'landed squash');
  assert.equal(landedOf(f.archived), 'safe');
});

test('--remove bundles a commit no ref reaches and removes the landed worktree', () => {
  const f = fixture();
  const lost = commitOnDetachedHead(f.archived);
  git(f.archived, 'switch', '-q', 'archived');
  const run = spawnSync(process.execPath, [SCAN, '--repo', f.main, '--remove', f.archived], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout);
  const saved = run.stdout.match(/ {2}saved (\S+)/u)?.[1];
  assert.ok(saved, run.stdout);
  assert.ok(!existsSync(f.archived), 'the worktree is gone');
  assert.equal(unbundle(f.root, join(saved, 'commits.bundle')).show(`${lost}:lost.txt`), 'only here\n');
});

test('--remove takes only the paths before the next flag', () => {
  const f = fixture();
  const run = spawnSync(process.execPath, [SCAN, '--remove', f.archived, '--repo', f.main], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout);
  assert.equal(run.stdout.trim(), `REMOVED  ${f.archived}`, "the --repo value is not queued for removal");
});
