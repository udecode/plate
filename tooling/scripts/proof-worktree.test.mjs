import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const helper = path.resolve(import.meta.dirname, 'proof-worktree.mjs');

const createRepository = (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'plate-proof-worktree-'));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const repository = path.join(root, 'repo');
  const git = (...args) =>
    execFileSync('git', args, { cwd: repository, encoding: 'utf-8' });
  execFileSync('git', ['init', '--quiet', repository]);
  writeFileSync(path.join(repository, 'package.json'), '{}\n');
  writeFileSync(path.join(repository, 'feature.txt'), 'base\n');
  const commit = (message) =>
    git(
      '-c',
      'user.name=proof',
      '-c',
      'user.email=proof@example.com',
      'commit',
      '--quiet',
      '-m',
      message
    );
  git('add', '.');
  commit('base');
  return { commit, git, repository, root };
};

const runHelper = (cwd, args) =>
  spawnSync('node', [helper, ...args], { cwd, encoding: 'utf-8' });

test('labels a worktree that holds candidate files a candidate, never a base', (t) => {
  const { repository, root } = createRepository(t);
  writeFileSync(path.join(repository, 'feature.txt'), 'candidate\n');
  const worktree = path.join(root, 'overlay');

  const result = runHelper(repository, [
    worktree,
    'HEAD',
    '--with',
    'feature.txt',
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(path.join(worktree, 'feature.txt'), 'utf-8'),
    'candidate\n'
  );
  assert.match(result.stdout, /^candidate: base .+ with feature\.txt$/mu);
  assert.doesNotMatch(result.stdout, /^base:/mu);
});

test('runs a command in the worktree, logs its exit status and removes the worktree', (t) => {
  const { git, repository, root } = createRepository(t);
  const worktree = path.join(root, 'proof-run-worktree');
  const runDirectory = path.join(root, 'proof');

  const result = runHelper(repository, [
    worktree,
    'HEAD',
    '--dir',
    runDirectory,
    '--name',
    'base-run',
    '--',
    'cat feature.txt; exit 3',
  ]);

  assert.equal(result.status, 3, result.stderr);
  const [log] = readdirSync(runDirectory);
  const text = readFileSync(path.join(runDirectory, log), 'utf-8');
  assert.match(text, /^base$/mu);
  assert.match(text, /^exit=3$/mu);
  assert.equal(existsSync(worktree), false);
  assert.doesNotMatch(git('worktree', 'list'), /proof-run-worktree/u);
});

test('refuses a proof directory inside the worktree it removes', (t) => {
  const { repository, root } = createRepository(t);
  const worktree = path.join(root, 'proof-dir-worktree');

  const result = runHelper(repository, [
    worktree,
    'HEAD',
    '--dir',
    path.join(worktree, 'proofs'),
    '--name',
    'base-run',
    '--',
    'true',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /lies inside the worktree/u);
  assert.equal(existsSync(worktree), false);
});

test('refuses a proof directory that reaches the worktree through a symlink', (t) => {
  const { repository, root } = createRepository(t);
  mkdirSync(path.join(root, 'real'));
  symlinkSync(path.join(root, 'real'), path.join(root, 'alias'));

  const result = runHelper(repository, [
    path.join(root, 'alias', 'wt'),
    'HEAD',
    '--dir',
    path.join(root, 'real', 'wt', 'proofs'),
    '--name',
    'base-run',
    '--',
    'true',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /lies inside the worktree/u);
  assert.equal(existsSync(path.join(root, 'real', 'wt')), false);
});

test('refuses a --with path outside the checkout', (t) => {
  const { repository, root } = createRepository(t);
  writeFileSync(path.join(root, 'outside.txt'), 'outside\n');

  const result = runHelper(repository, [
    path.join(root, 'with-worktree'),
    'HEAD',
    '--with',
    '../outside.txt',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /names no file inside/u);
  assert.equal(existsSync(path.join(root, 'with-worktree')), false);
});

test('copies a --with path that leaves and re-enters the checkout into the worktree', (t) => {
  const { repository, root } = createRepository(t);
  writeFileSync(path.join(repository, 'feature.txt'), 'candidate\n');
  const worktree = path.join(root, 'reentry');

  const result = runHelper(repository, [
    worktree,
    'HEAD',
    '--with',
    '../repo/feature.txt',
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(path.join(worktree, 'feature.txt'), 'utf-8'),
    'candidate\n'
  );
});

test('replaces a base symlink at a --with path instead of writing through it', (t) => {
  const { commit, git, repository, root } = createRepository(t);
  writeFileSync(path.join(root, 'outside.txt'), 'outside\n');
  symlinkSync('../outside.txt', path.join(repository, 'linked.txt'));
  git('add', 'linked.txt');
  commit('link');
  rmSync(path.join(repository, 'linked.txt'));
  writeFileSync(path.join(repository, 'linked.txt'), 'candidate\n');
  const worktree = path.join(root, 'linked-worktree');

  const result = runHelper(repository, [
    worktree,
    'HEAD',
    '--with',
    'linked.txt',
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(path.join(root, 'outside.txt'), 'utf-8'),
    'outside\n'
  );
  assert.equal(
    readFileSync(path.join(worktree, 'linked.txt'), 'utf-8'),
    'candidate\n'
  );
});

test('refuses a --with path whose base directory links outside the worktree', (t) => {
  const { commit, git, repository, root } = createRepository(t);
  mkdirSync(path.join(root, 'elsewhere'));
  symlinkSync('../elsewhere', path.join(repository, 'shared'));
  git('add', 'shared');
  commit('link');
  rmSync(path.join(repository, 'shared'));
  mkdirSync(path.join(repository, 'shared'));
  writeFileSync(path.join(repository, 'shared', 'file.txt'), 'candidate\n');

  const result = runHelper(repository, [
    path.join(root, 'shared-worktree'),
    'HEAD',
    '--with',
    'shared/file.txt',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /passes through a symlink in the worktree/u);
  assert.equal(existsSync(path.join(root, 'elsewhere', 'file.txt')), false);
});

test('refuses a --with path that reaches its file through a symlink in the checkout', (t) => {
  const { repository, root } = createRepository(t);
  mkdirSync(path.join(repository, 'sub'));
  writeFileSync(path.join(repository, 'sub', 'file.txt'), 'candidate\n');
  symlinkSync('sub', path.join(repository, 'alias'));

  const result = runHelper(repository, [
    path.join(root, 'alias-worktree'),
    'HEAD',
    '--with',
    'alias/file.txt',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /reached without a symlink/u);
});

test('resolves a --with path from the current directory', (t) => {
  const { repository, root } = createRepository(t);
  mkdirSync(path.join(repository, 'sub'));
  writeFileSync(path.join(repository, 'feature.txt'), 'candidate\n');
  const worktree = path.join(root, 'cwd-worktree');

  const result = runHelper(path.join(repository, 'sub'), [
    worktree,
    'HEAD',
    '--with',
    '../feature.txt',
  ]);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    readFileSync(path.join(worktree, 'feature.txt'), 'utf-8'),
    'candidate\n'
  );
});

test('never copies an env file through a symlink the base tracks at its path', (t) => {
  const { commit, git, repository, root } = createRepository(t);
  writeFileSync(path.join(root, 'outside.txt'), 'outside\n');
  symlinkSync('../outside.txt', path.join(repository, '.env.local'));
  git('add', '.env.local');
  commit('link');
  git('rm', '--cached', '--quiet', '.env.local');
  commit('untrack');
  rmSync(path.join(repository, '.env.local'));
  writeFileSync(path.join(repository, '.env.local'), 'TOKEN=local\n');

  const result = runHelper(repository, [
    path.join(root, 'env-worktree'),
    'HEAD~1',
  ]);

  assert.equal(
    readFileSync(path.join(root, 'outside.txt'), 'utf-8'),
    'outside\n',
    'the .env copy wrote outside the worktree'
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /not clean/u);
});

test('never links node_modules through a package directory the base links elsewhere', (t) => {
  const { commit, git, repository, root } = createRepository(t);
  mkdirSync(path.join(root, 'elsewhere'));
  symlinkSync('../elsewhere', path.join(repository, 'pkg'));
  git('add', 'pkg');
  commit('link');
  git('rm', '--cached', '--quiet', 'pkg');
  rmSync(path.join(repository, 'pkg'));
  mkdirSync(path.join(repository, 'pkg', 'node_modules'), { recursive: true });
  writeFileSync(path.join(repository, 'pkg', 'package.json'), '{}\n');
  git('add', 'pkg/package.json');
  commit('package');

  const result = runHelper(repository, [
    path.join(root, 'pkg-worktree'),
    'HEAD~1',
  ]);

  assert.equal(
    existsSync(path.join(root, 'elsewhere', 'node_modules')),
    false,
    'the node_modules link landed outside the worktree'
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /passes through a symlink in the worktree/u);
});

test('exits 1 when the command passed but the worktree could not be removed', (t) => {
  const { repository, root } = createRepository(t);
  const worktree = path.join(root, 'locked-worktree');

  const result = runHelper(repository, [
    worktree,
    'HEAD',
    '--dir',
    path.join(root, 'proof'),
    '--name',
    'locked',
    '--',
    'git worktree lock .',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /could not remove/u);
});

const runExpectingFailure = (t, command, expected) => {
  const { repository, root } = createRepository(t);
  return runHelper(repository, [
    path.join(root, 'expect-fail-worktree'),
    'HEAD',
    '--dir',
    path.join(root, 'proof'),
    '--name',
    'expect-fail',
    ...expected.flatMap((text) => ['--expect-fail', text]),
    '--',
    command,
  ]);
};

test('refuses an --expect-fail run whose command passes at the commit', (t) => {
  const result = runExpectingFailure(t, 'echo "(pass) named case"', [
    '(fail) named case',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /passed, so it cannot show its named defect/u);
});

test('refuses an --expect-fail run that fails without its named failure', (t) => {
  const result = runExpectingFailure(t, 'echo "import failed"; exit 1', [
    '(fail) named case',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /does not show: \(fail\) named case/u);
});

test('accepts an --expect-fail run that fails with every named failure', (t) => {
  const result = runExpectingFailure(
    t,
    'echo "(fail) first case"; echo "(fail) second case"; exit 1',
    ['(fail) first case', '(fail) second case']
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /^fails as expected: \(fail\) first case, \(fail\) second case$/mu
  );
});

test('refuses an --expect-fail run whose named failure appears only in its command line', (t) => {
  const result = runExpectingFailure(t, 'exit 1 # (fail) named case', [
    '(fail) named case',
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /does not show: \(fail\) named case/u);
});

test('creates a worktree without a command when the proof helper is absent', (t) => {
  const { repository, root } = createRepository(t);
  const copy = path.join(root, 'helper-copy', 'tooling', 'scripts');
  mkdirSync(copy, { recursive: true });
  writeFileSync(
    path.join(copy, 'proof-worktree.mjs'),
    readFileSync(helper, 'utf-8')
  );
  const worktree = path.join(root, 'no-proof-helper');

  const result = spawnSync(
    'node',
    [path.join(copy, 'proof-worktree.mjs'), worktree, 'HEAD'],
    { cwd: repository, encoding: 'utf-8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /^base: .+, clean$/mu);
});

test('exits 2 when the proof helper refuses its arguments', (t) => {
  const { repository, root } = createRepository(t);
  const worktree = path.join(root, 'bad-name-worktree');

  const result = runHelper(repository, [
    worktree,
    'HEAD',
    '--dir',
    path.join(root, 'proof'),
    '--name',
    '../escape',
    '--',
    'true',
  ]);

  assert.equal(result.status, 2);
  assert.match(
    result.stderr,
    /^Usage: node tooling\/scripts\/proof-worktree\.mjs/mu
  );
  assert.equal(existsSync(worktree), false);
});

test('exits 2 under --expect-fail when the command cannot start', (t) => {
  const { repository, root } = createRepository(t);

  const result = runHelper(repository, [
    path.join(root, 'missing-command-worktree'),
    'HEAD',
    '--dir',
    path.join(root, 'proof'),
    '--name',
    'missing-command',
    '--expect-fail',
    '(fail) named case',
    '--',
    path.join(root, 'no-such-command'),
    '--version',
  ]);

  assert.equal(result.status, 2);
  assert.match(result.stderr, /did not run to an exit status/u);
});

test('refuses a command before creating a worktree when the proof helper is absent', (t) => {
  const { repository, root } = createRepository(t);
  const copy = path.join(root, 'helper-copy', 'tooling', 'scripts');
  mkdirSync(copy, { recursive: true });
  writeFileSync(
    path.join(copy, 'proof-worktree.mjs'),
    readFileSync(helper, 'utf-8')
  );

  const result = spawnSync(
    'node',
    [
      path.join(copy, 'proof-worktree.mjs'),
      path.join(root, 'never-created'),
      'HEAD',
      '--dir',
      path.join(root, 'proof'),
      '--name',
      'absent-helper',
      '--',
      'true',
    ],
    { cwd: repository, encoding: 'utf-8' }
  );

  assert.equal(result.status, 2);
  assert.doesNotMatch(result.stdout, /^worktree /mu);
});
