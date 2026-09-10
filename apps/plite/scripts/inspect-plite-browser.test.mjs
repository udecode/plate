import assert from 'node:assert/strict';
import test from 'node:test';

import { discoverExampleJourneys } from './inspect-plite-browser.mjs';

const registrySource = `export const EXAMPLE_NAMES_AND_PATHS = [['A', 'a'], ['B', 'b'], ['C', 'c']] as const satisfies readonly ExampleDefinition[];
export const HIDDEN_EXAMPLES = ['b'] as const;`;

test('journeys retain exact user actions, assertions and scoped setup/cleanup', () => {
  const source = `test.describe.skip('A', () => {
    test.beforeEach(async ({ page }) => page.goto('/examples/plite/a'));
    test.afterEach(async () => cleanup());
    test('types and persists', async ({ page }) => {
      await page.keyboard.type('hello');
      await expect(page.locator('editor')).toContainText('hello');
    });
    test.describe('B', () => {
      test('opens another route', async ({ page }) => {
        await openExample(page, 'plite/b');
        await expect(page.locator('button')).toBeVisible();
      });
    });
    test.use({ locale: 'en-GB' });
    test.skip(process.env.NO_BROWSER === '1', 'Browser unavailable');
  });`;
  const { entries, unresolved } = discoverExampleJourneys({
    registrySource,
    files: [{ file: 'apps/plite/tests/example.test.ts', source }],
  });
  assert.equal(unresolved.length, 0);
  assert.deepEqual(
    entries.map((entry) => [entry.slug, entry.journeys.length, entry.hidden]),
    [
      ['a', 1, false],
      ['b', 1, true],
      ['c', 0, false],
    ]
  );
  const journey = entries[0].journeys[0];
  assert.equal(journey.title, 'types and persists');
  assert.match(journey.source, /keyboard.type\('hello'\)/);
  assert.match(journey.source, /toContainText\('hello'\)/);
  assert.equal(journey.hooks.length, 2);
  assert.match(journey.hooks[1].source, /cleanup/);
  assert.equal(journey.line, 4);
  assert.equal(journey.command.at(-1), 'tests/example.test.ts:4');
  assert.equal(entries[1].journeys[0].hooks.length, 2);
  assert.deepEqual(entries[1].journeys[0].suiteModes, [
    'test.describe.skip',
    'test.describe',
  ]);
  assert.equal(journey.configuration.length, 2);
  assert.match(journey.configuration[0].source, /locale: 'en-GB'/);
  assert.match(entries[1].journeys[0].configuration[1].source, /NO_BROWSER/);
});

test('dynamic titles and unbound routes remain explicit gaps rather than invented coverage', () => {
  const { entries, unresolved } = discoverExampleJourneys({
    registrySource,
    files: [
      {
        file: 'dynamic.test.ts',
        source: `
    test(name, async ({ page }) => page.goto('/examples/plite/a'));
    test('unknown route', async ({ page }) => page.goto(route));
    test.skip('supported skip', async ({ page }) => page.goto('/examples/plite/b?mode=fixture'));
  `,
      },
    ],
  });
  assert.equal(unresolved.length, 2);
  assert.equal(entries[0].journeys.length, 0);
  assert.equal(entries[1].journeys[0].declaredMode, 'test.skip');
});

test('local setup helpers and fixed routes with dynamic query values remain discoverable', () => {
  const { entries } = discoverExampleJourneys({
    registrySource,
    files: [
      {
        file: 'helpers.test.ts',
        source:
          "const open = async (page) => page.goto('/examples/plite/a');\ntest('drag', async ({page}) => { await open(page); await page.drag(); });\ntest('peers', async ({page}) => { const peer = (id) => `/examples/plite/b?peer=${id}`; await page.goto(peer('first')); });",
      },
    ],
  });
  assert.equal(entries[0].journeys[0].title, 'drag');
  assert.match(entries[0].journeys[0].helpers[0].source, /page.goto/);
  assert.equal(entries[1].journeys[0].title, 'peers');
});

test('suite-local helpers retain lexical routes and scoped execution metadata', () => {
  const source = `test.setTimeout(60000);
    test.describe('parent', { annotation: { type: 'plite-browser-profile', description: 'heavy' } }, () => {
      const open = async (page) => page.goto('/examples/plite/a');
      test('outer', async ({ page }) => open(page));
      test.describe('nested', () => {
        const open = async (page) => page.goto('/examples/plite/b');
        test.setTimeout(90000);
        test('inner', async ({ page }) => open(page));
      });
      test('outer again', async ({ page }) => open(page));
    });`;
  const { entries, unresolved } = discoverExampleJourneys({
    registrySource,
    files: [{ file: 'scoped.test.ts', source }],
  });

  assert.equal(unresolved.length, 0);
  assert.deepEqual(
    entries[0].journeys.map(({ title }) => title),
    ['outer', 'outer again']
  );
  const inner = entries[1].journeys[0];
  assert.equal(inner.title, 'inner');
  assert.match(inner.helpers[0].source, /plite\/b/);
  assert.deepEqual(
    inner.configuration.map((setup) => setup.source),
    ['test.setTimeout(60000)', 'test.setTimeout(90000)']
  );
  assert.equal(inner.suites[0].title, 'parent');
  assert.match(inner.suites[0].details.source, /plite-browser-profile/);
  assert.equal(inner.suites[1].title, 'nested');
  assert.equal(entries[0].journeys[1].configuration.length, 1);
});

test('parameterized routes remain unresolved without executing helper calls', () => {
  const source = `const open = async (page, slug) => openExample(page, \`plite/\${slug}\`);
    test('first', async ({ page }) => open(page, 'a'));
    test('both', async ({ page }) => { await open(page, 'a'); await open(page, 'b'); });
    test('unknown', async ({ page }) => open(page, process.env.ROUTE));`;
  const { entries, unresolved } = discoverExampleJourneys({
    registrySource,
    files: [{ file: 'arguments.test.ts', source }],
  });

  assert.deepEqual(entries[0].journeys, []);
  assert.deepEqual(entries[1].journeys, []);
  assert.equal(unresolved.length, 3);
  assert.match(unresolved[0].reason, /No literal route/);
});
