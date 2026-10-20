import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const helper = path.resolve(import.meta.dirname, 'type-probe.mjs');

const setup = (t, compilerScript) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'plate-type-probe-'));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const probe = path.join(root, 'probe.ts');
  writeFileSync(probe, 'export const n: number = 1;\n');
  const compiler = path.join(root, 'tsc');
  writeFileSync(
    compiler,
    `#!/bin/sh\n${compilerScript.replaceAll('PROBE', probe)}\n`
  );
  chmodSync(compiler, 0o755);
  const result = spawnSync(
    'node',
    [helper, '--tsc', compiler, '--out', path.join(root, 'out'), probe],
    {
      encoding: 'utf-8',
    }
  );
  return {
    output: `${result.stdout}${result.stderr}`,
    probe,
    status: result.status,
  };
};

test('fails when the compiler exits without a diagnostic', (t) => {
  const { output, status } = setup(t, 'exit 42');

  assert.equal(status, 2);
  assert.match(output, /tsc exited 42 without a diagnostic/);
});

test('fails when the compiler exits clean without reading the probe', (t) => {
  const { output, status } = setup(t, 'exit 0');

  assert.equal(status, 2);
  assert.match(output, /tsc did not list .*probe\.ts among the files it read/);
});

test('fails when the compiler is killed', (t) => {
  const { output, status } = setup(t, 'kill -9 $$');

  assert.equal(status, 2);
  assert.match(output, /tsc did not run: signal SIGKILL/);
});

test("prints the probe's errors and exits 1", (t) => {
  const { output, status } = setup(
    t,
    "echo PROBE\necho \"PROBE(3,7): error TS2322: Type 'string' is not assignable to type 'number'.\"\nexit 2"
  );

  assert.equal(status, 1);
  assert.match(
    output,
    /probe\.ts:3:7 TS2322 Type 'string' is not assignable to type 'number'\./
  );
  assert.match(output, /1 error\(s\) in 1 probe\(s\)/);
});

test('counts errors outside the probes without failing on them', (t) => {
  const { output, status } = setup(
    t,
    'echo PROBE\necho "/elsewhere/other.ts(1,1): error TS2304: Cannot find name \'process\'."\nexit 2'
  );

  assert.equal(status, 0);
  assert.match(output, /1 error\(s\) outside the probes/);
  assert.match(output, /0 error\(s\) in 1 probe\(s\)/);
});

test('compiles a probe against plitejs with the repository compiler', (t) => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'plate-type-probe-'));
  t.after(() => rmSync(root, { force: true, recursive: true }));
  const probe = path.join(root, 'probe.ts');
  writeFileSync(
    probe,
    "import type { Value } from 'plitejs';\nexport const value: Value = [];\nexport const n: number = 'one';\n"
  );
  const result = spawnSync(
    'node',
    [helper, '--out', path.join(root, 'out'), probe],
    { encoding: 'utf-8' }
  );

  assert.equal(result.status, 1, result.stderr);
  assert.match(
    result.stdout,
    /probe\.ts:3:14 TS2322 Type 'string' is not assignable to type 'number'\./
  );
  assert.match(result.stdout, /1 error\(s\) in 1 probe\(s\)/);
});
