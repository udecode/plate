import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, realpathSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { diskReport } from './disk.mjs';

const MB = 1024 ** 2;
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

function blob(path, bytes) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, Buffer.alloc(bytes, 1));
}

function ageTree(path, days) {
  const old = new Date(Date.now() - days * 86_400_000);
  for (const entry of readdirSync(path, { recursive: true })) utimesSync(join(path, entry), old, old);
  utimesSync(path, old, old);
}

const fixture = () => realpathSync(mkdtempSync(join(tmpdir(), 'cleanup-disk-')));

test('worktrees each below the size floor are summed into one row for their repository', async () => {
  const root = fixture();
  const main = join(root, 'main');
  mkdirSync(main);
  git(main, 'init', '-q', '-b', 'next');
  git(main, '-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '--allow-empty', '-m', 'base');
  for (const name of ['a', 'b', 'c']) {
    git(main, 'worktree', 'add', '-q', '--detach', join(root, 'wts', name));
    blob(join(root, 'wts', name, 'build.bin'), MB);
  }
  const { rows } = await diskReport({ roots: [root], min: 2 * MB });
  const group = rows.find((row) => row.repo === main);
  assert.ok(group, 'a row sums the worktrees of main');
  assert.equal(group.members.length, 3);
  assert.ok(group.bytes >= 3 * MB);
});

test('a folder is quiet only when nothing in it was written in the last day', async () => {
  const root = fixture();
  blob(join(root, 'quiet', 'old.bin'), 3 * MB);
  blob(join(root, 'active', 'new.bin'), 3 * MB);
  blob(join(root, 'mixed', 'old', 'old.bin'), 3 * MB);
  ageTree(join(root, 'quiet'), 2);
  ageTree(join(root, 'mixed'), 2);
  writeFileSync(join(root, 'mixed', 'note.txt'), 'fresh\n');
  const { rows } = await diskReport({ roots: [root], min: 2 * MB });
  const written = (name) => rows.find((row) => row.path === join(root, name))?.written;
  assert.equal(written('quiet'), false);
  assert.equal(written('active'), true);
  assert.equal(written('mixed/old'), false);
  assert.equal(written('mixed'), true, 'a small file written beside a quiet row keeps its folder written');
});
