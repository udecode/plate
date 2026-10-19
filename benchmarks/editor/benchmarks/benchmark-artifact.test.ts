import assert from 'node:assert/strict';
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

import {
  writeBenchmarkArtifact,
  writeBenchmarkResult,
} from './benchmark-artifact';

test('atomically creates a benchmark artifact in a missing directory', (t) => {
  const workspace = mkdtempSync(join(tmpdir(), 'plite-benchmark-artifact-'));
  const outputPath = join(workspace, 'missing', 'nested', 'result.json');

  t.after(() => rmSync(workspace, { force: true, recursive: true }));

  writeBenchmarkArtifact(outputPath, '{"ok":true}\n');

  assert.equal(readFileSync(outputPath, 'utf-8'), '{"ok":true}\n');
  assert.deepEqual(readdirSync(dirname(outputPath)), ['result.json']);
});

test('replaces an older passing artifact with unpassed measurements when strict validation fails', (t) => {
  const workspace = mkdtempSync(join(tmpdir(), 'plite-benchmark-artifact-'));
  const outputPath = join(workspace, 'result.json');

  t.after(() => rmSync(workspace, { force: true, recursive: true }));
  writeFileSync(
    outputPath,
    JSON.stringify({
      rows: [],
      strictValidation: { requested: true, status: 'passed' },
    })
  );

  assert.throws(
    () =>
      writeBenchmarkResult({
        outputPath,
        result: { rows: [{ p95Ms: 1200 }] },
        strict: true,
        validate: () => {
          throw new Error('budget failure');
        },
      }),
    /budget failure/u
  );
  assert.deepEqual(JSON.parse(readFileSync(outputPath, 'utf-8')), {
    rows: [{ p95Ms: 1200 }],
    strictValidation: { requested: true, status: 'measured' },
  });
});

test('rewrites a successful strict artifact as passed', (t) => {
  const workspace = mkdtempSync(join(tmpdir(), 'plite-benchmark-artifact-'));
  const outputPath = join(workspace, 'result.json');

  t.after(() => rmSync(workspace, { force: true, recursive: true }));
  const output = writeBenchmarkResult({
    outputPath,
    result: {},
    strict: true,
    validate: () => undefined,
  });

  assert.equal(readFileSync(outputPath, 'utf-8'), output);
  assert.equal(JSON.parse(output).strictValidation.status, 'passed');
});
