import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { parseRun, readCatalogs, scope, verdict } from './playtest.mjs';

const LOG = `$ (/repo/apps/www) pnpm exec playwright test --project=chromium

Running 3 tests using 1 worker

  ✓    1 [chromium] › tests/browser/a.spec.ts:10:5 › group › keeps text (1.9s)
  ✘    2 [chromium] › tests/browser/a.spec.ts:20:5 › group › drops caret (2.1s)
  ✘    3 [chromium] › tests/browser/b.spec.ts:30:5 › restores insertion (9.8s)

  1) [chromium] › tests/browser/a.spec.ts:20:5 › group › drops caret

    Error: Expected collapsed selection

  2) [chromium] › tests/browser/b.spec.ts:30:5 › restores insertion

    TimeoutError: locator.click: Timeout 8000ms exceeded

  2 failed
    [chromium] › tests/browser/a.spec.ts:20:5 › group › drops caret
    [chromium] › tests/browser/b.spec.ts:30:5 › restores insertion
  1 passed (14.0s)
exit=1
`;

function checkout(catalog) {
  const root = mkdtempSync(path.join(tmpdir(), 'playtest-'));
  const write = (file, text = '') => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), text);
  };
  write('packages/plitejs/src/authored/record.ts');
  write('apps/www/tests/browser/suggestion.spec.ts');
  write('docs/editor-behavior/scenarios/suggestions.md', catalog);
  execFileSync('git', ['init', '-q'], { cwd: root });
  return root;
}

const catalog = (specs) => `---
feature: suggestions
reference: Google Docs suggesting mode
routes: [/docs/suggestion]
paths: [packages/plitejs/src/authored]
www-specs: [${specs}]
plite-specs: []
---

| # | Action | Expected |
| --- | --- | --- |
| S1 | Type a word | One insertion card |
`;

test('a run lists every failed test with its first error line and every passed test', () => {
  const run = parseRun(LOG);
  assert.equal(run.passed, 1);
  assert.deepEqual(
    run.failures.map((failure) => [failure.file, failure.title, failure.error]),
    [
      [
        'tests/browser/a.spec.ts',
        'group › drops caret',
        'Error: Expected collapsed selection',
      ],
      [
        'tests/browser/b.spec.ts',
        'restores insertion',
        'TimeoutError: locator.click: Timeout 8000ms exceeded',
      ],
    ]
  );
  assert.deepEqual(
    [...run.passes],
    ['chromium › tests/browser/a.spec.ts › group › keeps text']
  );
});

const CONTROL_LOG = `  ✘    1 [chromium] › tests/browser/a.spec.ts:20:5 › group › drops caret (2.0s)
  ✓    2 [chromium] › tests/browser/b.spec.ts:28:5 › restores insertion (3.1s)

  1) [chromium] › tests/browser/a.spec.ts:20:5 › group › drops caret 

    Error: Expected collapsed selection

  1 failed
    [chromium] › tests/browser/a.spec.ts:20:5 › group › drops caret 
  1 passed (5.1s)
`;

test('a control run tells an old failure from one the tree introduced', () => {
  const [caret, insertion] = parseRun(LOG).failures.map((failure) => ({
    ...failure,
    runner: 'www',
  }));
  const control = {
    runs: [
      {
        engine: 'chromium',
        exit: 1,
        parsed: parseRun(CONTROL_LOG),
        runner: 'www',
      },
    ],
  };
  assert.equal(verdict(caret, control), 'fails the same');
  assert.equal(verdict(insertion, control), 'passes');
});

test('a catalog covers files under its paths and not a sibling that shares a prefix', () => {
  const root = checkout(catalog('tests/browser/suggestion.spec.ts'));
  assert.deepEqual(
    scope(root, ['packages/plitejs/src/authored/record.ts']).map(
      (each) => each.feature
    ),
    ['suggestions']
  );
  assert.deepEqual(scope(root, ['packages/plitejs/src/authoredX.ts']), []);
});

test('a catalog that names a missing spec file is refused', () => {
  const root = checkout(catalog('tests/browser/renamed.spec.ts'));
  assert.throws(
    () => readCatalogs(root),
    /names missing paths apps\/www\/tests\/browser\/renamed\.spec\.ts/
  );
});
