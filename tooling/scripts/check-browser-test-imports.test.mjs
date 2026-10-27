import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { checkBrowserTestImports } from './check-browser-test-imports.mjs';

const run = (source, fix = false) => {
  const root = mkdtempSync(path.join(tmpdir(), 'browser-test-imports-'));

  writeFileSync(path.join(root, 'spec.ts'), source);

  const { problems } = checkBrowserTestImports({
    files: ['spec.ts'],
    fix,
    root,
  });

  return {
    problems: problems.map((problem) =>
      problem.replace(/^spec\.ts:(\d+):\d+: /u, '$1: ')
    ),
    text: readFileSync(path.join(root, 'spec.ts'), 'utf-8'),
  };
};
const problems = (source) => run(source).problems;
const opens = (line, call) =>
  `${line}: ${call}, which opens a context or browser the capture does not read`;

test('refuses every way a spec takes test or expect from Playwright at runtime', () => {
  assert.deepEqual(
    problems(`import { expect, test as it } from '@playwright/test';
import base from 'playwright/test';
import * as pw from '@playwright/test';
export { expect } from '@playwright/test';
export * from '@playwright/test';
const { test } = require('@playwright/test');
const loaded = require('@playwright/test');
const { expect: check } = await import('@playwright/test');
require('@playwright/test').test('x', () => {});
(await import('@playwright/test'))['expect'];
`),
    [
      '1: expect from Playwright',
      '1: test from Playwright',
      "2: a default import, which is Playwright's test",
      '3: a namespace import of Playwright; import the names you use',
      '4: a re-export of expect from Playwright',
      '5: a re-export of every Playwright export',
      '6: test from Playwright',
      '7: a namespace load of Playwright; destructure the names you use',
      '8: expect from Playwright',
      '9: test from Playwright',
      '10: a computed name read from Playwright',
    ]
  );
});

test("refuses each other spelling of Playwright's test and each load that keeps the whole module", () => {
  assert.deepEqual(
    problems(`import { default as it } from '@playwright/test';
export { default } from '@playwright/test';
export { default as base } from 'playwright/test';
const { ...pw } = await import('@playwright/test');
const { default: plain } = require('@playwright/test');
import whole = require('@playwright/test');
(await import('@playwright/test')).default;
import('@playwright/test').then(({ test }) => test);
let late;
late = require('@playwright/test');
`),
    [
      "1: default from Playwright, which is Playwright's test",
      '2: a re-export of default from Playwright',
      '3: a re-export of default from Playwright',
      '4: a rest binding of Playwright; destructure the names you use',
      "5: default from Playwright, which is Playwright's test",
      '6: a namespace import of Playwright; import the names you use',
      "7: default from Playwright, which is Playwright's test",
      '8: an import of Playwright that is not awaited; await it and destructure the names you use',
      '10: a namespace load of Playwright; destructure the names you use',
    ]
  );
});

test('accepts types and the Playwright exports the package does not replace', () => {
  assert.deepEqual(
    problems(`import type { Page } from '@playwright/test';
import { type TestInfo, devices } from '@playwright/test';
import { defineConfig } from '@playwright/test';
type Context = import('@playwright/test').BrowserContext;
const cli = require.resolve('@playwright/test/cli');
const entry = require.resolve('@playwright/test');
const { devices: presets } = await import('@playwright/test');
const config = require('@playwright/test').defineConfig;
`),
    []
  );
});

test('refuses each call that opens a context or browser apart from the test', () => {
  assert.deepEqual(
    problems(`await browser.newContext();
await browser.newPage();
await playwright.chromium.launch();
await chromium.launchPersistentContext('dir');
await firefox.connect('ws://x');
await playwright.webkit.connect('ws://x');
await browser.browserType().connect('ws://x');
await browserType.connect('ws://x');
const remote = (fast ? chromium : webkit).connect('ws://x');
await chromium.connectOverCDP('http://x');
await context.newPage();
await page.context().newPage();
net.connect(1234);
await request.newContext();
await playwright.request.newContext();
`),
    [
      opens(1, 'newContext'),
      opens(2, 'browser.newPage'),
      opens(3, 'launch'),
      opens(4, 'launchPersistentContext'),
      opens(5, 'connect'),
      opens(6, 'connect'),
      opens(7, 'connect'),
      opens(8, 'connect'),
      opens(9, 'connect'),
      opens(10, 'connectOverCDP'),
      opens(14, 'newContext'),
      opens(15, 'newContext'),
    ]
  );
});

test("refuses Playwright's test reached through a module member, an internal export or a renamed require", () => {
  const member = (line, name) =>
    `${line}: ${name} from Playwright; a spec loads only chromium, defineConfig, devices, errors, firefox, mergeExpects, mergeTests, request, selectors, webkit from it at runtime, and imports a type with import type`;

  assert.deepEqual(
    problems(`const { 'extend': extend } = require('@playwright/test');
const { extend: derive } = require('@playwright/test');
const derived = require('@playwright/test').extend({});
import { _baseTest } from '@playwright/test';
const { test } = createRequire(import.meta.url)('@playwright/test');
const { expect } = load('@playwright/test');
`),
    [
      member(1, 'extend'),
      member(2, 'extend'),
      member(3, 'extend'),
      member(4, '_baseTest'),
      '5: test from Playwright',
      '6: expect from Playwright',
    ]
  );
});

test('a marker excuses the openers in the statement under it, however many lines it spans', () => {
  assert.deepEqual(
    problems(`// browser-test-imports: each arm runs in its own browser process
const target =
  isolated && realm > 0
    ? await browser
        .browserType()
        .launch({ headless })
    : browser;
const other = await browser.newContext();
`),
    [opens(8, 'newContext')]
  );
});

test('refuses a marker that excuses nothing, has no reason or sits above an import', () => {
  assert.deepEqual(
    problems(`// browser-test-imports: nothing below opens anything
const value = 1;
// browser-test-imports:
await browser.newContext();
// browser-test-imports: the bench keeps Playwright's own test
import { test } from '@playwright/test';
`),
    [
      '1: a marker with nothing under it to excuse; delete it',
      '3: a marker with no reason after its colon',
      opens(4, 'newContext'),
      '5: a marker above an import; a marker never excuses an import',
      '6: test from Playwright',
    ]
  );
});

test('--fix moves the named imports to the package and leaves excused openers', () => {
  const merged = run(
    `import { type Page, expect, test } from '@playwright/test';
import { openExample } from '@platejs/test/playwright';

// browser-test-imports: the bench measures memory in its own browser
const bench = await chromium.launch();
`,
    true
  );

  assert.deepEqual(merged, {
    problems: [],
    text: `import type { Page } from '@playwright/test';
import { expect, openExample, test } from '@platejs/test/playwright';

// browser-test-imports: the bench measures memory in its own browser
const bench = await chromium.launch();
`,
  });
  assert.deepEqual(
    run(
      `// Donor rows keep the shared fixture signature.
import { expect, test } from '@playwright/test';
`,
      true
    ),
    {
      problems: [],
      text: `// Donor rows keep the shared fixture signature.
import { expect, test } from '@platejs/test/playwright';
`,
    }
  );
});
