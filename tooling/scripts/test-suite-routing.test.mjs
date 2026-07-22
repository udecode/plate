import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { globSync } from 'tinyglobby';

import {
  TEST_FAST_IGNORE_PATTERNS,
  TEST_FILE_PATTERNS,
  TEST_IGNORE_PATTERNS,
  TEST_SLOW_FILE_PATTERNS,
} from '../config/test-suites.mjs';

test('routes tooling slow contracts exclusively through the slow suite', (t) => {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'plate-test-suites-'));
  const toolingRoot = path.join(fixtureRoot, 'tooling/scripts');
  const fastFixture = 'tooling/scripts/fixture.test.mjs';
  const slowFixture = 'tooling/scripts/fixture.slow.test.mjs';

  t.after(() => rmSync(fixtureRoot, { force: true, recursive: true }));
  mkdirSync(toolingRoot, { recursive: true });
  writeFileSync(path.join(fixtureRoot, fastFixture), '');
  writeFileSync(path.join(fixtureRoot, slowFixture), '');

  const fastFiles = new Set(
    globSync(TEST_FILE_PATTERNS, {
      cwd: fixtureRoot,
      ignore: TEST_FAST_IGNORE_PATTERNS,
      onlyFiles: true,
    })
  );
  const slowFiles = new Set(
    globSync(TEST_SLOW_FILE_PATTERNS, {
      cwd: fixtureRoot,
      ignore: TEST_IGNORE_PATTERNS,
      onlyFiles: true,
    })
  );

  assert.equal(fastFiles.has(fastFixture), true);
  assert.equal(fastFiles.has(slowFixture), false);
  assert.equal(slowFiles.has(fastFixture), false);
  assert.equal(slowFiles.has(slowFixture), true);
});
