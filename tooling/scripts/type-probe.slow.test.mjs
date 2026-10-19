import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const helper = path.resolve(import.meta.dirname, 'type-probe.mjs');

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
