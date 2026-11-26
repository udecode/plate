import assert from 'node:assert/strict';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, symlinkSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { zstdCompressSync } from 'node:zlib';
import { autoCleanup, brief, deleteSafe, landed, removeLanded, scan } from './scan.mjs';

Object.assign(process.env, { CODEX_HOME: mkdtempSync(join(tmpdir(), 'cleanup-codex-')), GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' });

const LSOF = execFileSync('sh', ['-c', 'command -v lsof'], { encoding: 'utf8' }).trim();
const BIN = mkdtempSync(join(tmpdir(), 'cleanup-bin-'));
writeFileSync(join(BIN, 'lsof'), `#!/bin/sh\nif [ -n "$CLEANUP_REAL_LSOF_PID" ]; then\n  case " $* " in *" cwd "*) '${LSOF}' -a -p "$CLEANUP_REAL_LSOF_PID" "$@"; exit 0 ;; esac\n  exec '${LSOF}' -a -p "$CLEANUP_REAL_LSOF_PID" "$@"\nfi\n[ -n "$CLEANUP_REAL_LSOF" ] && exec '${LSOF}' "$@"\ncase " $* " in *" cwd "*) exit 0 ;; esac\nexit 1\n`, { mode: 0o755 });
process.env.PATH = `${BIN}:${process.env.PATH}`;
const realLsof = (t, pid) => {
  if (pid) process.env.CLEANUP_REAL_LSOF_PID = String(pid);
  else process.env.CLEANUP_REAL_LSOF = '1';
  t.after(() => {
    delete process.env.CLEANUP_REAL_LSOF;
    delete process.env.CLEANUP_REAL_LSOF_PID;
  });
};

const DAY = 86_400_000;
const SCAN = join(dirname(fileURLToPath(import.meta.url)), 'scan.mjs');
const BLOCK = (word) => `a\nb\nc\n${word}\nd\ne\nf\n`;
const FILLER = (tag) => Array.from({ length: 10 }, (_, n) => `${tag} ${n}\n`).join('');
const DUP = `${FILLER('head')}${BLOCK('OLD')}${FILLER('middle')}${BLOCK('NEW')}${FILLER('tail')}`;
const git = (cwd, ...args) => execFileSync('git', ['-c', 'protocol.file.allow=always', ...args], { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const age = (path, days) => {
  const old = new Date(Date.now() - days * DAY);
  utimesSync(path, old, old);
};
const ageTree = (path, days) => {
  if (statSync(path).isDirectory()) for (const name of readdirSync(path)) ageTree(join(path, name), days);
  age(path, days);
};

const FIXTURE_WORKTREES = ['open', 'archived', 'landed', 'unlanded', 'orphan'];
let fixtureTemplate;
function baseFixture() {
  if (fixtureTemplate) return fixtureTemplate;
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'cleanup-scan-tpl-')));
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
  const wt = (name) => {
    const p = join(root, name);
    git(main, 'worktree', 'add', '-q', '-b', name, p);
    return p;
  };
  const open = wt('open');
  wt('archived');
  const landedWt = wt('landed');
  writeFileSync(join(landedWt, 'a.txt'), 'two\n');
  writeFileSync(join(landedWt, 'new.txt'), 'new\n');
  writeFileSync(join(main, 'a.txt'), 'two\n');
  writeFileSync(join(main, 'new.txt'), 'new\n');
  writeFileSync(join(wt('unlanded'), 'a.txt'), 'three\n');
  wt('orphan');
  const caches = join(main, 'apps', 'www');
  for (const [name, days] of Object.entries({ '.next': 5, '.next-plite': 5, '.next-3000': 5, '.next-3001': 5, '.next-chip-a1': 5, '.next-s5': 3 })) {
    const dev = join(caches, name, 'dev');
    mkdirSync(dev, { recursive: true });
    if (name === '.next-3001') writeFileSync(join(dev, 'lock'), '');
    if (name === '.next-s5') writeFileSync(join(caches, name, 'BUILD_ID'), 'b\n');
    for (const p of [join(dev, 'lock'), join(caches, name, 'BUILD_ID'), dev, join(caches, name)]) if (existsSync(p)) age(p, days);
  }
  const buildLock = join(caches, '.next', 'dev', 'lock');
  writeFileSync(buildLock, '');
  const manifest = join(caches, '.next-plite', 'dev', 'server', 'app-paths-manifest.json');
  mkdirSync(dirname(manifest));
  writeFileSync(manifest, '{}\n');
  for (const p of [join(caches, '.next', 'cache'), join(caches, '.next', 'server'), join(caches, '.next-plite', 'cache')]) mkdirSync(p);
  for (const p of [buildLock, join(caches, '.next', 'dev'), join(caches, '.next', 'cache'), dirname(manifest), join(caches, '.next-plite', 'dev'), join(caches, '.next-plite', 'cache')]) age(p, 5);
  mkdirSync(join(open, 'apps', 'www', '.next-chip-z'), { recursive: true });
  mkdirSync(join(open, 'apps', 'www', '.next-3002'));
  fixtureTemplate = { root };
  return fixtureTemplate;
}

function fixture() {
  const tpl = baseFixture();
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'cleanup-scan-')));
  cpSync(tpl.root, root, { recursive: true, preserveTimestamps: true });
  const main = join(root, 'main');
  for (const name of FIXTURE_WORKTREES) {
    const wtGit = join(root, name, '.git');
    writeFileSync(wtGit, readFileSync(wtGit, 'utf8').replaceAll(tpl.root, root));
    const gitdir = join(main, '.git', 'worktrees', name, 'gitdir');
    writeFileSync(gitdir, readFileSync(gitdir, 'utf8').replaceAll(tpl.root, root));
  }
  const [open, archived, landedWt, unlanded, orphan] = FIXTURE_WORKTREES.map((n) => join(root, n));
  const caches = join(main, 'apps', 'www');
  const lock = join(caches, '.next-3001', 'dev', 'lock');
  const buildLock = join(caches, '.next', 'dev', 'lock');
  for (const [name, days] of Object.entries({ '.next': 5, '.next-plite': 5, '.next-3000': 5, '.next-3001': 5, '.next-chip-a1': 5, '.next-s5': 3 })) {
    const dev = join(caches, name, 'dev');
    for (const p of [join(dev, 'lock'), join(caches, name, 'BUILD_ID'), dev, join(caches, name)]) if (existsSync(p)) age(p, days);
  }
  for (const p of [buildLock, join(caches, '.next', 'dev'), join(caches, '.next', 'cache'), join(caches, '.next-plite', 'dev', 'server'), join(caches, '.next-plite', 'dev'), join(caches, '.next-plite', 'cache')]) age(p, 5);
  const keptCache = join(open, 'apps', 'www', '.next-chip-z');
  const keptPort = join(open, 'apps', 'www', '.next-3002');
  age(keptCache, 5);
  age(keptPort, 5);
  const sessions = [
    { cwd: open, isArchived: false, isRunning: true, title: 'still running' },
    { cwd: orphan, isArchived: false, isRunning: false, title: 'open but idle' },
    { cwd: archived, isArchived: true, title: 'done' },
    { cwd: landedWt, isArchived: true, title: 'landed card' },
    { cwd: unlanded, isArchived: true, title: 'lost work' },
  ];
  return { archived, buildLock, caches, keptCache, keptPort, landed: landedWt, lock, main, open, orphan, root, sessions, unlanded };
}

function pstackFixture() {
  const f = fixture();
  mkdirSync(join(f.main, '.agents'), { recursive: true });
  writeFileSync(join(f.main, '.agents', 'pstack.json'), '{"plans":"docs/plans"}\n');
  writeFileSync(join(f.main, '.git', 'info', 'exclude'), '.source/\ndocs/plans/artifacts/\n');
  return f;
}

const verdicts = (items) => Object.fromEntries(items.map((item) => [item.path, item.verdict]));
const verdictOf = (f, path) => scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.find((item) => item.path === path)?.verdict;
const landedOf = (path) => landed({ worktree: path })[0];
const quietGit = (path, days) => {
  const admin = git(path, 'rev-parse', '--absolute-git-dir').trim();
  const log = join(admin, 'logs', 'HEAD');
  const old = Math.floor((Date.now() - days * DAY) / 1000);
  writeFileSync(log, readFileSync(log, 'utf8').replace(/> \d+ /gu, `> ${old} `));
  for (const file of ['index', 'HEAD']) age(join(admin, file), days);
};
const commitOnDetachedHead = (path) => {
  git(path, 'switch', '-q', '--detach');
  writeFileSync(join(path, 'lost.txt'), 'only here\n');
  git(path, 'add', 'lost.txt');
  git(path, 'commit', '-q', '-m', 'made on a detached HEAD');
  return git(path, 'rev-parse', 'HEAD').trim();
};
const unbundle = (root, bundle) => {
  const fresh = mkdtempSync(join(root, 'fresh-'));
  git(fresh, 'init', '-q');
  git(fresh, 'fetch', '-q', bundle, 'refs/cleanup/*:refs/restored/*');
  const tip = git(fresh, 'for-each-ref', '--format=%(objectname)', 'refs/restored').trim().split('\n')[0];
  return { tip, show: (rev) => git(fresh, 'show', rev) };
};

test('scan classifies live/idle/pinned/unclaimed worktrees, Next.js caches, server locks, invoking worktree, quiet git vs recent files, and brief', async (t) => {
  const f = fixture();
  const deep = join(f.archived, 'l1', 'l2', 'l3', 'l4', '.next-deep', 'dev');
  mkdirSync(deep, { recursive: true });
  writeFileSync(join(deep, 'lock'), '');
  const server = spawn('tail', ['-f', f.lock, f.buildLock, join(deep, 'lock')], { cwd: f.root, stdio: 'ignore' });
  realLsof(t, server.pid);
  await new Promise((done) => setTimeout(done, 250));
  try {
    const now = Date.now();
    const byPath = verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now }).items);
    assert.equal(byPath[f.open], 'keep');
    assert.equal(byPath[f.archived], 'keep', 'deep server lock inside worktree keeps it');
    assert.equal(byPath[f.landed], 'safe');
    assert.equal(byPath[f.unlanded], 'safe');
    assert.equal(byPath[f.orphan], 'keep');
    assert.equal(verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now: now + 2 * DAY }).items)[f.orphan], 'safe');
    assert.equal(byPath[join(f.caches, '.next', 'dev')], 'keep');
    assert.equal(byPath[join(f.caches, '.next', 'cache')], 'keep');
    assert.equal(byPath[join(f.caches, '.next-plite', 'dev')], 'keep');
    assert.equal(byPath[join(f.caches, '.next-plite', 'cache')], 'safe');
    assert.equal(byPath[join(f.caches, '.next-s5')], 'keep');
    assert.equal(byPath[join(f.caches, '.next-3000')], 'keep');
    assert.equal(byPath[f.keptPort], 'safe');
    assert.equal(byPath[join(f.caches, '.next-3001')], 'keep');
    assert.equal(byPath[join(f.caches, '.next-chip-a1')], 'safe');
    assert.equal(byPath[f.keptCache], 'safe');

    const unclaimed = f.sessions.filter((s) => s.cwd !== f.orphan);
    assert.equal(verdicts(scan({ repo: f.main, sessions: unclaimed, sizes: false, now }).items)[f.orphan], 'keep');
    const later = verdicts(scan({ repo: f.main, sessions: unclaimed, sizes: false, now: now + 3 * DAY }).items);
    assert.equal(later[f.orphan], 'safe');
    assert.equal(later[join(f.caches, '.next-3000')], 'safe');

    // Pinned archived session stays keep; invoking worktree stays keep.
    const pinned = f.sessions.map((s) => (s.cwd === f.landed ? { ...s, pinned: true } : s));
    assert.equal(verdicts(scan({ repo: f.main, sessions: pinned, sizes: false, now }).items)[f.landed], 'keep');
    const fromWt = verdicts(scan({ repo: f.landed, sessions: f.sessions, sizes: false, now }).items);
    assert.equal(fromWt[f.landed], 'keep');
    assert.equal(fromWt[f.unlanded], 'safe');

    // quietGit vs recent file write on unclaimed worktree.
    quietGit(f.orphan, 3);
    assert.equal(verdictOf({ ...f, sessions: unclaimed }, f.orphan), 'safe');
    mkdirSync(join(f.orphan, 'artifacts'));
    const proof = join(f.orphan, 'artifacts', 'proof.log');
    writeFileSync(proof, 'fresh\n');
    assert.equal(verdictOf({ ...f, sessions: unclaimed }, f.orphan), 'keep');
    age(proof, 3);
    assert.equal(verdictOf({ ...f, sessions: unclaimed }, f.orphan), 'safe');

    assert.equal(brief({ repo: f.main, now }), 'cleanup: 0 worktrees and 3 Next cache folders here show no git or cache writes for 3 days; /cleanup removes the ones nothing uses and lists the rest.');
  } finally {
    server.kill();
  }
});

test('scan respects agent folders/branches, --repos discovery, submodules, nested worktrees, and cache-named worktrees', () => {
  const f = fixture();
  const codex = join(f.root, 'ellie-codex-lane');
  const claude = join(f.root, 'ellie-claude-lane');
  const proof = join(f.root, 'ellie-proof');
  git(f.main, 'worktree', 'add', '-q', '-b', 'codex/lane', codex);
  git(f.main, 'worktree', 'add', '-q', '-b', 'claude/lane', claude);
  git(f.main, 'worktree', 'add', '-q', '--detach', proof);
  for (const p of [codex, claude, proof, f.orphan]) quietGit(p, 3);
  const elsewhere = realpathSync(mkdtempSync(join(f.root, 'tmp-')));
  const run = spawnSync(process.execPath, [SCAN, '--repo', f.main, '--no-sizes'], { encoding: 'utf8', env: { ...process.env, TMPDIR: elsewhere } });
  for (const p of [codex, claude, proof]) assert.match(run.stdout, new RegExp(`SAFE .*${p} `), run.stdout);
  assert.match(run.stdout, new RegExp(`ASK .*${f.orphan}  it sits outside the folders agents make worktrees in`), run.stdout);

  // Submodule with uncommitted work, nested worktree, and cache-named worktree.
  const lib = join(f.root, 'lib');
  mkdirSync(lib);
  git(lib, 'init', '-q', '-b', 'main');
  writeFileSync(join(lib, 'x.txt'), 'x\n');
  git(lib, 'add', 'x.txt');
  git(lib, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', 'x');
  git(f.archived, 'submodule', 'add', '-q', lib, 'sub');
  git(f.archived, 'commit', '-q', '-m', 'add sub');
  writeFileSync(join(f.archived, 'sub', 'x.txt'), 'dirty\n');
  assert.equal(verdictOf(f, f.archived), 'ask');

  git(f.main, 'worktree', 'add', '-q', '--detach', join(f.landed, 'artifacts', 'inner'));
  assert.equal(verdictOf(f, f.landed), 'ask');

  const cacheNamed = join(f.unlanded, 'apps', 'www', '.next-review');
  git(f.main, 'worktree', 'add', '-q', '--detach', cacheNamed);
  for (const p of [cacheNamed, join(cacheNamed, '.git')]) age(p, 5);
  assert.deepEqual(scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.filter((i) => i.path === cacheNamed).map((i) => i.kind), ['worktree']);

  // --repos scans only repos with linked worktrees.
  const repos = realpathSync(mkdtempSync(join(tmpdir(), 'cleanup-repos-')));
  for (const name of ['with', 'without']) {
    mkdirSync(join(repos, name));
    git(join(repos, name), 'init', '-q', '-b', 'next');
    git(join(repos, name), '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '--allow-empty', '-m', 'base');
  }
  git(join(repos, 'with'), 'worktree', 'add', '-q', '-b', 'w', join(repos, 'with-w'));
  const out = execFileSync('node', [SCAN, '--repos', repos, '--no-sizes'], { cwd: repos, encoding: 'utf8' });
  assert.ok(out.includes(`## ${join(repos, 'with')}\n`) && out.includes(join(repos, 'with-w')) && !out.includes(join(repos, 'without')));
});

test('--landed verifies checkout parity, concurrent patches, staged/duplicate/case/symlink/build-log hazards, and pstack artifacts/squashes', () => {
  // Plain repo cases
  const f = fixture();
  assert.equal(spawnSync(process.execPath, [SCAN, '--landed', f.landed]).status, 0);
  assert.equal(spawnSync(process.execPath, [SCAN, '--landed'], { cwd: f.landed }).status, 0);

  // Concurrent patch in same file + ignored copies & node_modules/dist pass.
  const card = DUP.replace('head 0', 'HEAD 0');
  writeFileSync(join(f.archived, 'dup.txt'), card);
  writeFileSync(join(f.main, 'dup.txt'), card.replace('tail 9', 'TAIL 9'));
  writeFileSync(join(f.main, '.env.local'), 'KEY=1\n');
  writeFileSync(join(f.archived, '.env.local'), 'KEY=1\n');
  mkdirSync(join(f.archived, 'node_modules', 'pkg'), { recursive: true });
  writeFileSync(join(f.archived, 'node_modules', 'pkg', 'index.js'), '');
  mkdirSync(join(f.archived, 'packages', 'p', 'dist'), { recursive: true });
  writeFileSync(join(f.archived, 'packages', 'p', 'dist', 'index.js'), '');
  assert.equal(landedOf(f.archived), 'safe');

  // Unique .env.local fails CLI.
  writeFileSync(join(f.landed, '.env.local'), 'ONLY_HERE=1\n');
  assert.equal(spawnSync(process.execPath, [SCAN, '--landed', f.landed]).status, 1);

  // Proof log under artifacts/run/build asks; symlink resolving back into worktree asks; staged-differs asks; dup reverse patch asks; case-only rename asks.
  const f2 = fixture();
  mkdirSync(join(f2.archived, 'artifacts', 'run', 'build'), { recursive: true });
  writeFileSync(join(f2.archived, 'artifacts', 'run', 'build', 'mutants-a1.log'), 'caught\n');
  assert.equal(landedOf(f2.archived), 'ask');
  symlinkSync(join(f2.archived, 'artifacts'), join(f2.main, 'artifacts'));
  assert.equal(landedOf(f2.archived), 'ask');

  writeFileSync(join(f2.orphan, 'a.txt'), 'staged only\n');
  git(f2.orphan, 'add', 'a.txt');
  writeFileSync(join(f2.orphan, 'a.txt'), 'one\n');
  assert.equal(landedOf(f2.orphan), 'ask');

  writeFileSync(join(f2.open, 'dup.txt'), DUP.replace('OLD', 'NEW'));
  assert.equal(landedOf(f2.open), 'ask');

  git(f2.landed, 'mv', 'dup.txt', 'Dup.txt');
  assert.equal(landedOf(f2.landed), 'ask');

  // Pstack repo: .source ignored, missing run artifacts ask until checkout holds copy, reflog squash & landed unreached commit pass.
  const p = pstackFixture();
  mkdirSync(join(p.archived, 'apps', 'www', '.source'), { recursive: true });
  writeFileSync(join(p.archived, 'apps', 'www', '.source', 'browser.ts'), 'gen\n');
  assert.equal(landedOf(p.archived), 'safe');
  mkdirSync(join(p.archived, 'docs', 'plans', 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(p.archived, 'docs', 'plans', 'artifacts', 'run', 'proof.log'), 'exit 0\n');
  assert.equal(landedOf(p.archived), 'ask');
  mkdirSync(join(p.main, 'docs', 'plans', 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(p.main, 'docs', 'plans', 'artifacts', 'run', 'proof.log'), 'merged\n');
  assert.equal(landedOf(p.archived), 'safe');

  for (const name of ['b.txt', 'c.txt']) {
    writeFileSync(join(p.open, name), `${name}\n`);
    git(p.open, 'add', name);
    git(p.open, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', name);
  }
  git(p.open, 'reset', '-q', '--soft', 'HEAD~2');
  git(p.open, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', 'squashed');
  assert.equal(landedOf(p.open), 'safe');

  commitOnDetachedHead(p.orphan);
  git(p.orphan, 'switch', '-q', 'orphan');
  writeFileSync(join(p.main, 'lost.txt'), 'only here\n');
  git(p.main, 'add', 'lost.txt');
  git(p.main, 'commit', '-q', '-m', 'landed squash');
  assert.equal(landedOf(p.orphan), 'safe');
});

test('run folders strip after 1 day and expire after 7 unless cited; ignored .tmp expires safely while keeping unpushed/stashed/broken clones', () => {
  const f = pstackFixture();
  const runs = join(f.main, 'docs', 'plans', 'artifacts');
  const mkRun = (name, days) => {
    mkdirSync(join(runs, name, 'export', 'node_modules', 'dep'), { recursive: true });
    mkdirSync(join(runs, name, 'export', '.next', 'cache'), { recursive: true });
    writeFileSync(join(runs, name, 'proof.log'), 'exit 0\n');
    writeFileSync(join(runs, name, 'export', 'node_modules', 'dep', 'index.js'), '\n');
    ageTree(join(runs, name), days);
    return join(runs, name);
  };
  const [old, cited, active, stale, quiet, fresh] = [mkRun('old', 10), mkRun('cited', 10), mkRun('active', 10), mkRun('stale', 10), mkRun('quiet', 3), mkRun('fresh', 0)];
  writeFileSync(join(runs, 'suggested-tasks.decisions.tsv'), 'chip\tt1\tproof: docs/plans/artifacts/cited/proof.log\t\toffered\n');
  writeFileSync(join(f.main, 'docs', 'plans', 'active.decisions.tsv'), 'build\tx\ty\tproof: docs/plans/artifacts/active/proof.log\tpartial\n');
  writeFileSync(join(f.main, 'docs', 'plans', 'stale.decisions.tsv'), 'build\tx\ty\tproof: docs/plans/artifacts/stale/proof.log\tpartial\n');
  age(join(f.main, 'docs', 'plans', 'stale.decisions.tsv'), 10);

  const runMap = () => Object.fromEntries(scan({ repo: f.main, sessions: f.sessions, sizes: false }).items.filter((i) => i.kind === 'run').map((i) => [i.path, `${i.verdict} ${i.action ?? ''}`.trim()]));
  assert.deepEqual(runMap(), { [old]: 'safe expire', [stale]: 'safe expire', [cited]: 'safe strip', [active]: 'safe strip', [quiet]: 'safe strip', [fresh]: 'keep' });
  deleteSafe({ repo: f.main, sessions: f.sessions });
  assert.ok(!existsSync(old) && existsSync(join(fresh, 'export', 'node_modules')) && existsSync(join(runs, 'suggested-tasks.decisions.tsv')));
  for (const k of [cited, active, quiet]) assert.ok(existsSync(join(k, 'proof.log')) && !existsSync(join(k, 'export', 'node_modules')) && !existsSync(join(k, 'export', '.next')));

  // .tmp scratch copies
  const t = fixture();
  const tmp = join(t.main, '.tmp');
  const mkCommit = (repo, name) => {
    writeFileSync(join(repo, name), `${name}\n`);
    git(repo, 'add', name);
    git(repo, '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'commit', '-q', '-m', name);
  };
  mkdirSync(join(tmp, 'copy', 'node_modules', 'dep'), { recursive: true });
  writeFileSync(join(tmp, 'copy', 'result.json'), '{}\n');
  git(tmp, 'clone', '-q', t.main, 'synced');
  writeFileSync(join(tmp, 'synced', 'a.txt'), 'edited\n');
  git(tmp, 'clone', '-q', t.main, 'ahead');
  mkCommit(join(tmp, 'ahead'), 'b.txt');
  git(tmp, 'clone', '-q', t.main, 'stashed');
  writeFileSync(join(tmp, 'stashed', 'a.txt'), 'shelved\n');
  git(join(tmp, 'stashed'), '-c', 'user.email=t@example.com', '-c', 'user.name=t', 'stash', '-q');
  mkdirSync(join(tmp, 'scratch'));
  git(join(tmp, 'scratch'), 'init', '-q');
  mkCommit(join(tmp, 'scratch'), 'c.txt');
  mkdirSync(join(tmp, 'unborn'));
  git(join(tmp, 'unborn'), 'init', '-q');
  writeFileSync(join(tmp, 'unborn', 'd.txt'), 'draft\n');
  git(t.main, 'worktree', 'add', '-q', '--detach', join(tmp, 'dropped'));
  rmSync(readFileSync(join(tmp, 'dropped', '.git'), 'utf8').replace('gitdir: ', '').trim(), { recursive: true });
  ageTree(tmp, 10);

  const tmpMap = () => Object.fromEntries(scan({ repo: t.main, sessions: t.sessions, sizes: false }).items.filter((i) => i.kind === 'run').map((i) => [i.path, `${i.verdict} ${i.action ?? ''}`.trim()]));
  assert.deepEqual(tmpMap(), {}, 'unignored .tmp left alone');
  writeFileSync(join(t.main, '.git', 'info', 'exclude'), '.tmp/\n');
  assert.deepEqual(tmpMap(), { [join(tmp, 'copy')]: 'safe expire', [join(tmp, 'synced')]: 'safe expire', [join(tmp, 'ahead')]: 'ask', [join(tmp, 'stashed')]: 'ask', [join(tmp, 'scratch')]: 'ask', [join(tmp, 'unborn')]: 'safe expire', [join(tmp, 'dropped')]: 'ask' });
  const { removed } = deleteSafe({ repo: t.main, sessions: t.sessions });
  assert.match(readFileSync(removed.find((i) => i.path === join(tmp, 'synced')).patches[0], 'utf8'), /^\+edited$/mu);
  assert.match(readFileSync(removed.find((i) => i.path === join(tmp, 'unborn')).patches[0], 'utf8'), /^\+draft$/mu);
  assert.ok(existsSync(join(tmp, 'ahead', 'b.txt')) && existsSync(join(tmp, 'scratch', 'c.txt')) && existsSync(join(tmp, 'dropped', 'a.txt')));
});

test('--delete removes safe set, saves patches/staged/force-added/ignored/FIFOs, keeps process-held worktrees, and cleans stale refs/saves', async (t) => {
  const f = fixture();
  const proc = spawn('tail', ['-f', '/dev/null'], { cwd: f.landed, stdio: 'ignore' });
  realLsof(t, proc.pid);
  await new Promise((done) => setTimeout(done, 200));

  // Set up archived with staged-differs + FIFO + ignored file, and stale/fresh cleanup refs & week-old saves.
  writeFileSync(join(f.archived, 'a.txt'), 'draft\n');
  git(f.archived, 'add', 'a.txt');
  writeFileSync(join(f.archived, 'a.txt'), 'one\n');
  writeFileSync(join(f.archived, '.env.local'), 'ONLY_HERE=1\n');
  mkdirSync(join(f.archived, 'artifacts'));
  execFileSync('mkfifo', [join(f.archived, 'artifacts', 'pipe')]);
  writeFileSync(join(f.archived, 'artifacts', 'proof.log'), 'exit 0\n');
  writeFileSync(join(f.archived, 'artifacts', 'tracked.log'), 'forced\n');
  git(f.archived, 'add', '-f', 'artifacts/tracked.log');

  const head = git(f.main, 'rev-parse', 'HEAD').trim();
  const cleanup = join(f.main, '.git', 'cleanup');
  const [staleRef, freshRef] = [`proof-${(Date.now() - 2 * DAY).toString(36)}-abcdef`, `proof-${Date.now().toString(36)}-abcdef`];
  for (const each of [staleRef, freshRef]) {
    git(f.main, 'update-ref', `refs/cleanup/${each}/1`, head);
    mkdirSync(join(cleanup, `${each}.partial`), { recursive: true });
  }
  const [oldFolder, oldPatch, recentPatch, report] = ['old-wt-mvbdgkzl-abcdef', 'old-clone-mvbdgkzl.patch', 'recent-clone.patch', 'last-run'].map((n) => join(cleanup, n));
  mkdirSync(oldFolder, { recursive: true });
  writeFileSync(join(oldFolder, 'changes.patch'), 'x\n');
  for (const p of [oldPatch, recentPatch, report]) writeFileSync(p, 'x\n');
  for (const p of [oldFolder, oldPatch, report]) age(p, 8);
  age(recentPatch, 6);

  try {
    const { removed } = deleteSafe({ repo: f.main, sessions: f.sessions });
    assert.ok(existsSync(f.landed), 'process-held worktree stays');
    assert.ok(existsSync(f.open) && existsSync(f.orphan));
    assert.ok(!existsSync(f.archived) && !existsSync(f.unlanded));

    const archSaved = removed.find((i) => i.path === f.archived).saved;
    assert.match(readFileSync(join(archSaved, 'staged.patch'), 'utf8'), /^\+draft$/mu);
    assert.match(readFileSync(join(archSaved, 'changes.patch'), 'utf8'), /^\+forced$/mu);
    assert.equal(readFileSync(join(archSaved, 'ignored', '.env.local'), 'utf8'), 'ONLY_HERE=1\n');
    assert.equal(readFileSync(join(archSaved, 'ignored', 'artifacts', 'proof.log'), 'utf8'), 'exit 0\n');

    const unSaved = removed.find((i) => i.path === f.unlanded).saved;
    assert.match(readFileSync(join(unSaved, 'worktree'), 'utf8'), /^branch refs\/heads\/unlanded$/mu);
    assert.match(readFileSync(join(unSaved, 'changes.patch'), 'utf8'), /^\+three$/mu);
    git(f.main, 'checkout', '-q', '--', 'a.txt');
    git(f.main, 'apply', '--check', join(unSaved, 'changes.patch'));

    assert.equal(git(f.main, 'for-each-ref', '--format=%(refname)', 'refs/cleanup/').trim(), `refs/cleanup/${freshRef}/1`);
    assert.deepEqual(readdirSync(cleanup).filter((n) => n.endsWith('.partial')), [`${freshRef}.partial`]);
    assert.ok(!existsSync(oldFolder) && !existsSync(oldPatch) && existsSync(recentPatch) && existsSync(report));
  } finally {
    proc.kill();
  }

  // Pstack project copies only run artifacts, never generated .source/.
  const p = pstackFixture();
  mkdirSync(join(p.archived, 'apps', 'www', '.source'), { recursive: true });
  writeFileSync(join(p.archived, 'apps', 'www', '.source', 'browser.ts'), 'gen\n');
  mkdirSync(join(p.archived, 'docs', 'plans', 'artifacts', 'run'), { recursive: true });
  writeFileSync(join(p.archived, 'docs', 'plans', 'artifacts', 'run', 'proof.log'), 'exit 0\n');
  const pSaved = join(deleteSafe({ repo: p.main, sessions: p.sessions }).removed.find((i) => i.path === p.archived).saved, 'ignored');
  assert.equal(readFileSync(join(pSaved, 'docs', 'plans', 'artifacts', 'run', 'proof.log'), 'utf8'), 'exit 0\n');
  assert.ok(!existsSync(join(pSaved, 'apps')));
});

test('--delete handles save failures, same-ms collisions, missing folders, lost .git links, and unreached/PR-branch bundles', () => {
  // Save failure rollback (chmod 000), missing folder, lost .git link (empty vs files), same-ms collision.
  const f = fixture();
  const paths = ['x', 'y'].map((parent) => {
    const p = join(f.root, parent, 'proof');
    git(f.main, 'worktree', 'add', '-q', '-b', `proof-${parent}`, p);
    mkdirSync(join(p, 'artifacts'));
    writeFileSync(join(p, 'artifacts', 'p.log'), `${parent}\n`);
    return p;
  });
  // Missing folder (with unreached commit bundled from git record)
  const lostMissing = commitOnDetachedHead(f.unlanded);
  git(f.unlanded, 'switch', '-q', 'unlanded');
  renameSync(f.unlanded, `${f.unlanded}-moved`);
  // Lost .git link: empty with symlink vs non-empty
  rmSync(f.landed, { recursive: true });
  mkdirSync(join(f.landed, 'packages', 'p'), { recursive: true });
  symlinkSync(f.main, join(f.landed, 'node_modules'));
  rmSync(join(f.archived, '.git'));

  const sessions = [...f.sessions, ...paths.map((cwd) => ({ cwd, isArchived: true, title: 'done' }))];
  const clock = Date.now;
  const at = clock() + 1000;
  Date.now = () => at;
  let res;
  try {
    res = deleteSafe({ repo: f.main, sessions });
  } finally {
    Date.now = clock;
  }
  assert.ok(!existsSync(f.landed) && existsSync(join(f.main, 'a.txt')), 'empty broken worktree removed, symlink target kept');
  assert.ok(existsSync(join(f.archived, 'a.txt')), 'non-empty broken worktree kept');
  assert.ok(existsSync(`${f.unlanded}-moved`));
  assert.equal(unbundle(f.root, join(res.removed.find((i) => i.path === f.unlanded).saved, 'commits.bundle')).show(`${lostMissing}:lost.txt`), 'only here\n');
  for (const [p, parent] of [[paths[0], 'x'], [paths[1], 'y']]) {
    assert.equal(readFileSync(join(res.removed.find((i) => i.path === p).saved, 'ignored', 'artifacts', 'p.log'), 'utf8'), `${parent}\n`);
  }

  if (process.getuid?.() !== 0) {
    const fLock = fixture();
    mkdirSync(join(fLock.archived, 'artifacts'));
    const locked = join(fLock.archived, 'artifacts', 'b.log');
    writeFileSync(locked, 'b\n');
    chmodSync(locked, 0);
    try {
      const item = deleteSafe({ repo: fLock.main, sessions: fLock.sessions }).items.find((i) => i.path === fLock.archived);
      assert.match(item.reason, /^removal failed: /u);
      assert.ok(existsSync(locked));
      assert.deepEqual(readdirSync(join(fLock.main, '.git', 'cleanup')).filter((n) => n.startsWith('archived-')), []);
    } finally {
      chmodSync(locked, 0o644);
    }
  }

  // Unreached merge commit & PR-branch ancestor survive branch deletion + gc via commits.bundle.
  const fb = fixture();
  const remote = join(fb.root, 'remote.git');
  git(fb.root, 'init', '-q', '--bare', '-b', 'next', remote);
  git(fb.main, 'remote', 'add', 'origin', remote);
  git(fb.main, 'push', '-q', 'origin', 'next');
  git(fb.main, 'remote', 'set-head', 'origin', 'next');
  git(fb.archived, 'switch', '-q', '-c', 'pr');
  writeFileSync(join(fb.archived, 'pr.txt'), 'pull request\n');
  git(fb.archived, 'add', 'pr.txt');
  git(fb.archived, 'commit', '-q', '-m', 'pr');
  git(fb.archived, 'push', '-q', 'origin', 'pr');
  const lost = commitOnDetachedHead(fb.archived);
  git(fb.archived, 'switch', '-q', '-c', 'side', 'next');
  writeFileSync(join(fb.archived, 'side.txt'), 'side\n');
  git(fb.archived, 'add', 'side.txt');
  git(fb.archived, 'commit', '-q', '-m', 'side');
  git(fb.archived, 'switch', '-q', '--detach', lost);
  git(fb.archived, 'merge', '-q', '--no-ff', '--no-commit', 'side');
  writeFileSync(join(fb.archived, 'resolution.txt'), 'only in merge\n');
  git(fb.archived, 'add', 'resolution.txt');
  git(fb.archived, 'commit', '-q', '-m', 'merge side');
  const merge = git(fb.archived, 'rev-parse', 'HEAD').trim();
  git(fb.archived, 'switch', '-q', 'archived');
  git(fb.main, 'branch', '-D', '-q', 'pr');
  assert.equal(landedOf(fb.archived), 'ask');
  git(fb.main, 'branch', 'saved', merge);
  assert.equal(landedOf(fb.archived), 'safe');
  git(fb.main, 'branch', '-D', '-q', 'saved');

  const bundled = deleteSafe({ repo: fb.main, sessions: fb.sessions }).removed.find((i) => i.path === fb.archived);
  git(fb.main, 'push', '-q', 'origin', '--delete', 'pr');
  git(fb.main, 'reflog', 'expire', '--expire=now', '--expire-unreachable=now', '--all');
  git(fb.main, 'gc', '-q', '--prune=now');
  git(fb.main, 'fetch', '-q', join(bundled.saved, 'commits.bundle'), 'refs/cleanup/*:refs/restored/*');
  assert.equal(git(fb.main, 'show', `${merge}:resolution.txt`), 'only in merge\n');
  assert.equal(git(fb.main, 'show', `${lost}:pr.txt`), 'pull request\n');
});

test('--remove stops processes, runs companion detach, bundles unreached commits, parses flags, and refuses unresolved/locked/outside/broken worktrees', async (t) => {
  const f = fixture();
  const saved = join(dirname(f.main), 'detached');
  mkdirSync(join(f.main, '.agents'), { recursive: true });
  writeFileSync(join(f.main, '.agents/pstack.json'), JSON.stringify({ companion: { dir: '.git-private', detach: `cp .git-private ${saved}` } }));
  writeFileSync(join(f.open, '.git-private'), 'gitdir: shared\n');
  writeFileSync(join(f.open, 'a.txt'), 'four\n');

  const server = spawn('tail', ['-f', '/dev/null'], { cwd: f.open, stdio: 'ignore' });
  realLsof(t, server.pid);
  await new Promise((done) => setTimeout(done, 200));
  const exited = new Promise((done) => server.on('exit', done));
  const [rOpen] = removeLanded({ repo: f.main, worktrees: [f.open] });
  assert.equal(rOpen.removed, true, rOpen.reason);
  assert.equal(rOpen.stopped, 1);
  await exited;
  assert.equal(readFileSync(saved, 'utf8'), 'gitdir: shared\n');
  assert.match(readFileSync(join(rOpen.saved, 'changes.patch'), 'utf8'), /^\+four$/mu);

  // CLI --remove bundles unreached commit and stops path parsing at next flag.
  const lost = commitOnDetachedHead(f.archived);
  git(f.archived, 'switch', '-q', 'archived');
  const cli = spawnSync(process.execPath, [SCAN, '--remove', f.archived, '--repo', f.main], { encoding: 'utf8' });
  assert.equal(cli.status, 0, cli.stdout);
  const bundleDir = cli.stdout.match(/ {2}saved (\S+)/u)?.[1];
  assert.equal(unbundle(f.root, join(bundleDir, 'commits.bundle')).show(`${lost}:lost.txt`), 'only here\n');

  // Refusals: unresolved merge, lost .git link with files, main checkout, locked, outside agent folders.
  const f2 = fixture();
  git(f2.archived, 'switch', '-q', '-c', 'theirs');
  writeFileSync(join(f2.archived, 'a.txt'), 'theirs\n');
  git(f2.archived, 'commit', '-q', '-am', 'theirs');
  git(f2.archived, 'switch', '-q', 'archived');
  writeFileSync(join(f2.archived, 'a.txt'), 'mine\n');
  git(f2.archived, 'commit', '-q', '-am', 'mine');
  assert.equal(spawnSync('git', ['merge', '-q', 'theirs'], { cwd: f2.archived }).status, 1);
  assert.equal(verdictOf(f2, f2.archived), 'ask');
  const [mergeRes] = removeLanded({ repo: f2.main, worktrees: [f2.archived] });
  assert.equal(mergeRes.removed, false);
  assert.match(mergeRes.reason, /unresolved merge/u);

  rmSync(join(f2.orphan, '.git'));
  const [brokenRes] = removeLanded({ repo: f2.main, worktrees: [f2.orphan] });
  assert.equal(brokenRes.removed, false);
  assert.match(brokenRes.reason, /lost its link/u);

  git(f2.main, 'worktree', 'lock', '--reason', 'owner keeps it', f2.unlanded);
  const elsewhere = realpathSync(mkdtempSync(join(f2.root, 'tmp-')));
  const kept = spawnSync(process.execPath, [SCAN, '--repo', f2.main, '--remove', f2.main, f2.unlanded, f2.landed], { encoding: 'utf8', env: { ...process.env, TMPDIR: elsewhere } });
  assert.equal(kept.status, 1);
  assert.match(kept.stdout, new RegExp(`KEPT  ${f2.main}  git does not list it as a linked worktree`));
  assert.match(kept.stdout, new RegExp(`KEPT  ${f2.unlanded}  locked: owner keeps it`));
  assert.match(kept.stdout, new RegExp(`KEPT  ${f2.landed}  it sits outside the folders agents make worktrees in`));
});

test('transcripts (Claude scratch/project, Codex plain/zstd/corrupt) keep active worktrees, and autoCleanup respects daily stamp and models-sheet toggle', () => {
  const f = fixture();
  const config = join(f.root, 'claude-config');
  const id = '0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
  const proof = join(f.root, id, 'scratchpad', 'wt-proof');
  mkdirSync(dirname(proof), { recursive: true });
  git(f.main, 'worktree', 'add', '-q', '--detach', proof);
  const scratchTx = join(config, 'projects', '-repo', `${id}.jsonl`);
  const orphanTx = join(config, 'projects', f.orphan.replace(/[^a-zA-Z0-9]/gu, '-'), 'session.jsonl');
  mkdirSync(dirname(scratchTx), { recursive: true });
  mkdirSync(dirname(orphanTx), { recursive: true });
  writeFileSync(scratchTx, '{}\n');
  writeFileSync(orphanTx, '{}\n');

  const saved = process.env.CLAUDE_CONFIG_DIR;
  process.env.CLAUDE_CONFIG_DIR = config;
  const later = Date.now() + 2 * DAY;
  try {
    assert.equal(verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now: Date.now() }).items)[proof], 'keep');
    age(scratchTx, 2);
    assert.equal(verdicts(scan({ repo: f.main, sessions: f.sessions, sizes: false, now: Date.now() + 3 * DAY }).items)[proof], 'safe');

    utimesSync(orphanTx, new Date(later - 3_600_000), new Date(later - 3_600_000));
    assert.equal(verdicts(scan({ repo: f.main, sizes: false, now: later }).items)[f.orphan], 'keep');
    age(orphanTx, 0);
    assert.equal(verdicts(scan({ repo: f.main, sizes: false, now: later }).items)[f.orphan], 'safe');

    // Codex plain, zstd, and corrupt rollouts.
    const day = join(process.env.CODEX_HOME, 'sessions', '2026', '11', '15');
    mkdirSync(day, { recursive: true });
    const meta = `${JSON.stringify({ type: 'session_meta', payload: { cwd: join(f.orphan, 'apps') } })}\n{}\n`;
    const at = () => verdicts(scan({ repo: f.main, sizes: false, now: later }).items)[f.orphan];
    const writeRollout = (name, bytes) => {
      const p = join(day, name);
      writeFileSync(p, bytes);
      utimesSync(p, new Date(later - 3_600_000), new Date(later - 3_600_000));
      return p;
    };
    const plain = writeRollout('rollout-a.jsonl', meta);
    assert.equal(at(), 'keep');
    age(plain, 0);
    assert.equal(at(), 'safe');
    const packed = writeRollout('rollout-b.jsonl.zst', zstdCompressSync(meta));
    assert.equal(at(), 'keep');
    rmSync(packed);
    writeRollout('rollout-c.jsonl.zst', zstdCompressSync(meta).subarray(0, 8));
    assert.equal(at(), 'keep', 'corrupt recent rollout fails safe to keep');

    // autoCleanup daily throttling and opt-out.
    const started = [];
    const start = (repo, stamp) => started.push([repo, stamp]);
    const now = Date.now();
    const stamp = autoCleanup({ repo: f.orphan, now, start });
    assert.equal(stamp, join(f.main, '.git', 'cleanup', 'last-run'));
    assert.deepEqual(started, [[f.orphan, stamp]]);
    assert.equal(autoCleanup({ repo: f.main, now, start }), null);
    age(stamp, 2);
    writeFileSync(join(config, 'pstack-models.md'), 'auto cleanup: off\n');
    assert.equal(autoCleanup({ repo: f.main, now, start }), null);
    writeFileSync(join(config, 'pstack-models.md'), 'auto cleanup: on\n');
    assert.equal(autoCleanup({ repo: f.main, now, start }), stamp);
    assert.equal(started.length, 2);
  } finally {
    rmSync(join(process.env.CODEX_HOME, 'sessions'), { force: true, recursive: true });
    if (saved === undefined) delete process.env.CLAUDE_CONFIG_DIR;
    else process.env.CLAUDE_CONFIG_DIR = saved;
  }
});
