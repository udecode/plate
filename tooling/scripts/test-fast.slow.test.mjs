import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const testFastScript = path.join(import.meta.dirname, 'test-fast.mjs');

async function writeFixture(root, relativePath, content) {
  const file = path.join(root, relativePath);

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

async function runFastSuiteWithStaleSpec(staleSpecPath) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'plate-test-fast-'));

  try {
    execFileSync('git', ['init', '--quiet'], { cwd: root });
    await writeFixture(root, '.gitignore', '**/build\ndocs/plans/artifacts\n');
    await writeFixture(
      root,
      'packages/demo/demo.spec.ts',
      "import { test } from 'bun:test';\n\ntest('ok', () => {});\n"
    );
    await writeFixture(
      root,
      staleSpecPath,
      "import { test } from 'bun:test';\n\ntest('stale copy', () => { throw new Error('stale copy ran'); });\n"
    );

    return spawnSync(process.execPath, [testFastScript], {
      cwd: root,
      encoding: 'utf8',
    });
  } finally {
    await rm(root, { force: true, recursive: true });
  }
}

test('does not run copies of a spec under docs/plans/artifacts', async () => {
  const run = await runFastSuiteWithStaleSpec(
    'docs/plans/artifacts/snapshot/packages/demo/demo.spec.ts'
  );

  assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
});

test('does not discover a git-ignored spec inside a discovery root', async () => {
  const run = await runFastSuiteWithStaleSpec(
    'packages/demo/build/stale.spec.ts'
  );

  assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
});
