import { expect, type Page, test } from '@playwright/test';
import { openExample } from '@platejs/browser/playwright';

const getQueryParam = (page: Page, key: string) =>
  page.evaluate(
    (paramKey) => new URL(window.location.href).searchParams.get(paramKey),
    key
  );

test.describe('example query controls', () => {
  test('stores search highlighting control state in the URL', async ({
    page,
  }) => {
    await openExample(page, 'plite/search-highlighting', {
      query: { q: 'decorations' },
      ready: {
        editor: 'visible',
        selector: 'input[type="search"]',
      },
    });

    const search = page.locator('input[type="search"]');

    await expect(search).toHaveValue('decorations');
    await expect(page.locator('[data-cy="search-highlighted"]')).toHaveCount(1);

    await search.fill('text');

    await expect.poll(() => getQueryParam(page, 'q')).toBe('text');
  });

  test('stores android test selector state in the URL', async ({ page }) => {
    await openExample(page, 'plite/android-tests', {
      query: { test: 'insert' },
      ready: {
        editor: 'visible',
        text: /Type by tapping keys/,
      },
    });

    const selector = page.locator('#android-test-case');

    await expect(selector).toHaveValue('insert');
    await expect(
      page.locator('.plite-android-tests-instructions')
    ).toContainText('Enter text below each line');
    await selector.selectOption('autocorrect');

    await expect.poll(() => getQueryParam(page, 'test')).toBe('autocorrect');
  });

  test('stores DOM coverage boundary controls in the URL', async ({ page }) => {
    const editor = await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });

    await page.getByRole('button', { name: 'Outer' }).click();

    await expect(editor.root).toContainText('Hidden alpha');
    await expect.poll(() => getQueryParam(page, 'outer_hidden')).toBe('false');
  });

  test('loads hidden-content block controls from the URL', async ({ page }) => {
    const editor = await openExample(page, 'plite/hidden-content-blocks', {
      query: {
        accordion_open: true,
        collapsible_open: true,
        copy: 'exclude',
        selection: 'materialize',
        tab: 'details',
      },
      ready: {
        editor: 'visible',
        text: /Accordion secret alpha/,
      },
    });

    await expect(editor.root).toContainText('Accordion secret alpha');
    await expect(editor.root).toContainText('Collapsible hidden note');
    await expect(editor.root).toContainText('Details tab hidden text');
    await expect(page.getByTestId('tab-details')).toHaveAttribute(
      'data-state',
      'active'
    );
    await expect(
      page.getByTestId('hidden-content-selection-policy')
    ).toContainText('materialize');
    await expect(page.getByTestId('hidden-content-copy-policy')).toContainText(
      'exclude'
    );
  });

  test('stores huge-document perf controls in the URL', async ({ page }) => {
    await openExample(page, 'plite/huge-document', {
      query: {
        blocks: 120,
        content_visibility: 'none',
        strategy: 'staged',
        strict: false,
      },
      ready: {
        editor: 'visible',
      },
    });

    await expect(page.getByLabel('Blocks')).toHaveValue('120');
    await expect(
      page.locator('#huge-document-blocks option:checked')
    ).toHaveText('120');

    await page.getByLabel('DOM strategy').selectOption('virtualized');
    await expect
      .poll(() => getQueryParam(page, 'strategy'))
      .toBe('virtualized');

    await page.getByLabel('Editor height').fill('360');
    await expect.poll(() => getQueryParam(page, 'editor_height')).toBe('360');
  });

  test('loads pagination controls from the URL and stores updates', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination URL controls'
    );

    await openExample(page, 'plite/pagination', {
      query: {
        debug: true,
        margins: 72,
        media_height: 320,
        media_split: 'page',
        page_layout: 'single',
        page_overscan: 3,
        preset: 'letter',
        row_height: 44,
        rows: 96,
        strategy: 'virtualized',
      },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });

    await expect(page.getByLabel('Preset')).toHaveValue('letter');
    await expect(page.getByLabel('Margins')).toHaveValue('72');
    await expect(page.getByLabel('DOM strategy')).toHaveValue('virtualized');
    await expect(page.getByLabel('Rows')).toHaveValue('96');
    await expect(page.getByLabel('Row px')).toHaveValue('44');
    await expect(page.getByLabel('Page overscan')).toHaveValue('3');
    await expect(page.getByLabel('Media px')).toHaveValue('320');
    await expect(page.getByLabel('Media split')).toHaveValue('page');
    await expect(page.getByLabel('Facing')).not.toBeChecked();
    await expect(page.getByLabel('Debug')).toBeChecked();

    await page.getByLabel('Rows').fill('120');

    await expect.poll(() => getQueryParam(page, 'rows')).toBe('120');

    await page.getByLabel('Page overscan').fill('5');

    await expect.poll(() => getQueryParam(page, 'page_overscan')).toBe('5');
  });
});
