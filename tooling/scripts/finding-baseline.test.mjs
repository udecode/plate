import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

import { enforceBaseline, readBaseline } from './finding-baseline.mjs';

const savedBase = process.env.PLATE_BASELINE_BASE;

afterEach(() => {
  if (savedBase === undefined) delete process.env.PLATE_BASELINE_BASE;
  else process.env.PLATE_BASELINE_BASE = savedBase;
});

const check = (file) =>
  enforceBaseline({
    file,
    found: readBaseline(file),
    lowerCommand: 'pnpm lint:baseline',
    mode: 'check',
    newFindingsHelp: 'new findings',
    rules: [],
  });

test('refuses a base commit it cannot resolve instead of skipping the growth check', () => {
  process.env.PLATE_BASELINE_BASE = '0'.repeat(40);

  assert.equal(check('tooling/oxlint/plate-baseline.json'), 1);
});

test('accepts a resolvable base that predates the baseline file', () => {
  process.env.PLATE_BASELINE_BASE = 'HEAD';

  assert.equal(check('tooling/scripts/no-such-baseline.json'), 0);
});
