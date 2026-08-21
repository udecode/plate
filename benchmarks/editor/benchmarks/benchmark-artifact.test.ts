import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

import { writeBenchmarkArtifact } from './benchmark-artifact';

test('atomically creates a benchmark artifact in a missing directory', (t) => {
  const workspace = mkdtempSync(join(tmpdir(), 'plite-benchmark-artifact-'));
  const outputPath = join(workspace, 'missing', 'nested', 'result.json');

  t.after(() => rmSync(workspace, { force: true, recursive: true }));

  writeBenchmarkArtifact(outputPath, '{"ok":true}\n');

  assert.equal(readFileSync(outputPath, 'utf-8'), '{"ok":true}\n');
  assert.deepEqual(readdirSync(dirname(outputPath)), ['result.json']);
});
