import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const {
  createBunTestArgs,
} = require('../../packages/plate-scripts/bun-test-args.cjs');

test('runs package tests from the root Bun config with a package selector', () => {
  assert.deepEqual(
    createBunTestArgs({
      packageCwd: join(repoRoot, 'packages/date'),
      projectCwd: repoRoot,
    }),
    [
      `--config=${join(repoRoot, 'bunfig.toml')}`,
      `--cwd=${repoRoot}`,
      'test',
      'packages/date/',
    ]
  );
});

test('uses a package-boundary selector for prefix-sharing packages', () => {
  const listArgs = createBunTestArgs({
    packageCwd: join(repoRoot, 'packages/list'),
    projectCwd: repoRoot,
  });

  assert.equal(listArgs.at(-1), 'packages/list/');
  assert.notEqual(listArgs.at(-1), 'packages/list-classic/');
});

test('scopes explicit test paths without rewriting option values', () => {
  assert.deepEqual(
    createBunTestArgs({
      commandArgs: [
        '--rerun-each',
        '2',
        'src/lib/dateValue.spec.ts',
        '--reporter=dots',
      ],
      packageCwd: join(repoRoot, 'packages/date'),
      projectCwd: repoRoot,
      watch: true,
    }),
    [
      `--config=${join(repoRoot, 'bunfig.toml')}`,
      `--cwd=${repoRoot}`,
      'test',
      '--watch',
      '--rerun-each',
      '2',
      'packages/date/src/lib/dateValue.spec.ts',
      '--reporter=dots',
    ]
  );
});
