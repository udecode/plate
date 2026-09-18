import assert from 'node:assert/strict';
import {
  chmodSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

test('exact Chrome proof requires and attests the launched executable', () => {
  const capture = join(
    root,
    '.agents/rules/patch/scripts/capture-proof-receipt.mjs'
  );
  const fixtureDir = mkdtempSync(join(tmpdir(), 'regression-chrome-'));
  const fakeChrome = join(fixtureDir, 'chrome');

  writeFileSync(fakeChrome, '#!/bin/sh\nprintf "Google Chrome 999.0\\n"\n');
  chmodSync(fakeChrome, 0o755);

  try {
    const missingExecutable = spawnSync(
      process.execPath,
      [
        capture,
        '--case-id',
        'chrome-case',
        '--attempt',
        '1',
        '--claim',
        'completed',
        '--input',
        '.agents/rules/patch/scripts/capture-proof-receipt.test.mjs',
        '--host-pid',
        String(process.pid),
        '--base-url',
        'http://localhost:1',
        '--browser',
        'exact-chrome:test',
        '--retries',
        '0',
        '--',
        process.execPath,
        '-e',
        'process.exit(0)',
        'http://localhost:1',
      ],
      { cwd: root, encoding: 'utf8' }
    );

    assert.equal(missingExecutable.status, 1);
    assert.match(
      missingExecutable.stderr,
      /exact Chrome proof requires --browser-executable/
    );

    const attested = spawnSync(
      process.execPath,
      [
        capture,
        '--case-id',
        'chrome-case',
        '--attempt',
        '1',
        '--claim',
        'completed',
        '--input',
        '.agents/rules/patch/scripts/capture-proof-receipt.test.mjs',
        '--host-pid',
        String(process.pid),
        '--base-url',
        'http://localhost:1',
        '--browser',
        'exact-chrome:test',
        '--browser-executable',
        fakeChrome,
        '--retries',
        '0',
        '--',
        process.execPath,
        '-e',
        'process.exit(0)',
        fakeChrome,
        'http://localhost:1',
      ],
      { cwd: root, encoding: 'utf8' }
    );

    assert.equal(attested.status, 0, attested.stderr);
    assert.match(attested.stdout, /browser:exact-chrome:test/);
    assert.match(attested.stdout, /browser-executable:/);
    assert.match(attested.stdout, /browser-version:Google Chrome 999\.0/);
  } finally {
    rmSync(fixtureDir, { force: true, recursive: true });
  }
});

