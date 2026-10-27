import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('git-private.mjs', import.meta.url));
const identity = {
  GIT_AUTHOR_EMAIL: 'test@test',
  GIT_AUTHOR_NAME: 'test',
  GIT_COMMITTER_EMAIL: 'test@test',
  GIT_COMMITTER_NAME: 'test',
};

const sh = (cwd, command, args) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, ...identity },
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} exited ${result.status}: ${result.stderr}`
    );
  }
  return result.stdout;
};
const git = (cwd, ...args) => sh(cwd, 'git', args);
const cliWith = (env, cwd, ...args) =>
  spawnSync('node', [script, ...args], {
    cwd,
    encoding: 'utf-8',
    env: { ...process.env, ...identity, ...env },
  });
const cli = (cwd, ...args) => cliWith({}, cwd, ...args);
const write = (file, text) => {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
};
const read = (file) => readFileSync(file, 'utf-8');

// A public repository whose next has a commit from before the split, then the
// split, and a private repository holding the files the split stopped tracking.
const fixture = () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'git-private-test-'));
  const publicRemote = path.join(dir, 'public.git');
  const privateRemote = path.join(dir, 'private.git');
  git(dir, 'init', '--quiet', '--bare', '-b', 'next', publicRemote);
  git(dir, 'init', '--quiet', '--bare', '-b', 'next', privateRemote);

  const seed = path.join(dir, 'seed');
  git(dir, 'init', '--quiet', '-b', 'next', seed);
  write(path.join(seed, 'src/a.ts'), 'export const a = 1;\n');
  write(path.join(seed, 'src/a.spec.ts'), "import { a } from './a';\n");
  write(path.join(seed, 'docs/plan.md'), 'plan\n');
  // The tooling lands before the split, as it does in udecode/plate.
  mkdirSync(path.join(seed, 'tooling/scripts'), { recursive: true });
  copyFileSync(script, path.join(seed, 'tooling/scripts/git-private.mjs'));
  git(seed, 'add', '.');
  git(seed, 'commit', '--quiet', '-m', 'before the split');
  const beforeSplit = git(seed, 'rev-parse', 'HEAD').trim();
  write(path.join(seed, '.gitprivate'), '/docs/\n*.spec.ts\n');
  write(path.join(seed, '.gitignore'), '/.git-private\n');
  git(seed, 'rm', '--quiet', '--cached', 'src/a.spec.ts', 'docs/plan.md');
  git(seed, 'add', '.gitprivate', '.gitignore');
  git(seed, 'commit', '--quiet', '-m', 'split');
  git(seed, 'push', '--quiet', publicRemote, 'next');

  const privateSeed = path.join(dir, 'private-seed');
  git(dir, 'clone', '--quiet', privateRemote, privateSeed);
  write(
    path.join(privateSeed, 'src/a.spec.ts'),
    read(path.join(seed, 'src/a.spec.ts'))
  );
  write(path.join(privateSeed, 'docs/plan.md'), 'plan\n');
  git(privateSeed, 'add', '.');
  git(privateSeed, 'commit', '--quiet', '-m', 'start');
  git(privateSeed, 'push', '--quiet', 'origin', 'HEAD:next');

  const team = path.join(dir, 'team');
  git(dir, 'clone', '--quiet', publicRemote, team);
  const init = cli(team, 'init', '--remote', privateRemote);
  assert.equal(init.status, 0, init.stderr);
  return {
    beforeSplit,
    dir,
    privateRemote,
    privateSeed,
    publicRemote,
    seed,
    team,
  };
};

test('init and a new worktree hold both halves, and committed and unsaved private work outlive the removed worktree', () => {
  const { dir, team } = fixture();
  assert.equal(read(path.join(team, 'docs/plan.md')), 'plan\n');
  assert.equal(cli(team, 'status').stdout, '');

  const worktree = path.join(dir, 'session');
  git(team, 'worktree', 'add', '--quiet', '-b', 'topic', worktree);
  assert.ok(statSync(path.join(worktree, '.git-private')).isFile());
  assert.ok(existsSync(path.join(worktree, 'src/a.spec.ts')));

  write(path.join(worktree, 'src/a.spec.ts'), 'committed\n');
  assert.equal(
    cli(worktree, 'commit', '--quiet', '-am', 'session work').status,
    0
  );
  write(path.join(worktree, 'docs/plan.md'), 'unsaved\n');
  write(path.join(worktree, 'src/b.spec.ts'), 'new\n');
  assert.match(
    cli(worktree, 'status').stdout,
    /private \?\? src\/b\.spec\.ts/u
  );
  assert.match(
    cliWith({ GIT_LITERAL_PATHSPECS: '1' }, worktree, 'status').stdout,
    /private \?\? src\/b\.spec\.ts/u,
    'a caller that sets literal pathspecs still sees new private files'
  );
  assert.equal(cli(worktree, 'autosave').status, 0);

  unlinkSync(path.join(worktree, 'docs/plan.md'));
  assert.equal(cli(worktree, 'autosave').status, 0);

  const shared = ['--git-dir', path.join(team, '.git-private')];
  assert.equal(cli(worktree, 'detach').status, 0);
  assert.ok(!existsSync(path.join(worktree, '.git-private')));
  assert.doesNotMatch(
    git(team, ...shared, 'worktree', 'list'),
    /session/u,
    'detach removes the private record'
  );
  git(team, 'worktree', 'remove', '--force', worktree);
  assert.equal(
    git(team, ...shared, 'show', 'topic:src/a.spec.ts'),
    'committed\n'
  );
  const save = 'refs/git-private/autosave/topic';
  assert.equal(
    git(team, ...shared, 'show', `${save}:docs/plan.md`),
    'unsaved\n'
  );
  assert.equal(git(team, ...shared, 'show', `${save}:src/b.spec.ts`), 'new\n');
});

test('a checkout across the split and back, and a pull, leave no private file missing', () => {
  const { beforeSplit, privateSeed, seed, team } = fixture();
  git(team, 'checkout', '--quiet', beforeSplit);
  git(team, 'checkout', '--quiet', 'next');
  assert.equal(read(path.join(team, 'docs/plan.md')), 'plan\n');
  assert.equal(cli(team, 'ls-files', '--deleted').stdout, '');

  write(path.join(privateSeed, 'src/c.spec.ts'), 'pulled\n');
  git(privateSeed, 'add', '.');
  git(privateSeed, 'commit', '--quiet', '-m', 'private change');
  git(privateSeed, 'push', '--quiet', 'origin', 'HEAD:next');
  write(path.join(seed, 'src/c.ts'), 'export const c = 1;\n');
  git(seed, 'add', '.');
  git(seed, 'commit', '--quiet', '-m', 'public change');
  git(seed, 'push', '--quiet', path.join(seed, '../public.git'), 'next');
  git(team, 'pull', '--quiet', '--ff-only');
  assert.equal(read(path.join(team, 'src/c.spec.ts')), 'pulled\n');
});

test('migrate moves a branch cut before the split onto both repositories and keeps every change', () => {
  const { beforeSplit, dir, team } = fixture();
  const old = path.join(dir, 'old');
  git(team, 'worktree', 'add', '--quiet', '-b', 'old', old, beforeSplit);
  write(path.join(old, 'src/a.ts'), 'export const a = 2;\n');
  git(old, 'commit', '--quiet', '-am', 'public work');
  write(path.join(old, 'src/a.spec.ts'), 'private work\n');
  write(path.join(old, 'src/n.spec.ts'), 'new\n');

  const moved = cli(old, 'migrate');
  assert.equal(moved.status, 0, moved.stderr);
  assert.match(moved.stdout, /as uncommitted changes/u);
  assert.equal(
    git(old, 'rev-parse', 'HEAD'),
    git(team, 'rev-parse', 'origin/next')
  );
  assert.equal(git(old, 'diff', '--cached', '--name-only'), 'src/a.ts\n');
  assert.equal(read(path.join(old, 'src/a.spec.ts')), 'private work\n');
  const status = cli(old, 'status').stdout;
  assert.match(status, /private M\s+src\/a\.spec\.ts/u);
  assert.match(status, /private \?\? src\/n\.spec\.ts/u);
  assert.equal(
    git(team, 'show', 'refs/git-private/migrate/old:src/a.spec.ts'),
    'private work\n'
  );
  const committed = cli(old, 'commit', '--quiet', '-m', 'private work');
  assert.equal(committed.status, 0, committed.stderr);
  assert.equal(
    cli(old, 'clean', '-n').status,
    1,
    'clean through the private repository is refused'
  );
});

test('migrate exits 1 when a change conflicts with next, and keeps the change', () => {
  const { beforeSplit, dir, seed, team } = fixture();
  write(path.join(seed, 'src/a.ts'), 'export const a = 3;\n');
  git(seed, 'commit', '--quiet', '-am', 'next moves');
  git(seed, 'push', '--quiet', path.join(dir, 'public.git'), 'next');
  const old = path.join(dir, 'old');
  git(team, 'worktree', 'add', '--quiet', '-b', 'old', old, beforeSplit);
  write(path.join(old, 'src/a.ts'), 'export const a = 2;\n');
  git(old, 'commit', '--quiet', '-am', 'public work');

  const moved = cli(old, 'migrate');
  assert.equal(moved.status, 1, moved.stdout);
  assert.match(moved.stdout, /with conflicts to resolve/u);
  assert.equal(
    git(team, 'show', 'refs/git-private/migrate/old:src/a.ts'),
    'export const a = 2;\n'
  );
});

test('check refuses a forced add, a private import and a team worktree without its private half', () => {
  const { dir, team } = fixture();
  const clean = cli(team, 'check');
  assert.equal(clean.status, 0, clean.stderr);

  write(path.join(team, 'src/forced.spec.ts'), 'export {};\n');
  git(team, 'add', '-f', 'src/forced.spec.ts');
  const forced = cli(team, 'check');
  assert.equal(forced.status, 1);
  assert.match(
    forced.stderr,
    /src\/forced\.spec\.ts is tracked by udecode\/plate/u
  );
  git(team, 'rm', '--quiet', '--cached', 'src/forced.spec.ts');

  write(path.join(team, 'src/b.ts'), "export { a } from './a.spec';\n");
  const crossing = cli(team, 'check');
  assert.equal(crossing.status, 1);
  assert.match(crossing.stderr, /src\/b\.ts imports src\/a\.spec\.ts/u);
  unlinkSync(path.join(team, 'src/b.ts'));

  const bare = path.join(dir, 'no-private');
  git(
    team,
    '-c',
    'core.hooksPath=/dev/null',
    'worktree',
    'add',
    '--quiet',
    '--detach',
    bare
  );
  const missing = cli(bare, 'check');
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /has no \.git-private/u);
});
