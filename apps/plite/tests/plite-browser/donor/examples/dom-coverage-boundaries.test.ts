import { expect, type Locator, type Page, test } from '@playwright/test';

import { openExample } from '@platejs/browser/playwright';

const findRenderedText = async (page: Page, text: string) =>
  page.evaluate((query) => {
    const browserWindow = window as Window &
      typeof globalThis & {
        find?: (
          string: string,
          caseSensitive?: boolean,
          backwards?: boolean,
          wrapAround?: boolean,
          wholeWord?: boolean,
          searchInFrames?: boolean,
          showDialog?: boolean
        ) => boolean;
      };

    window.getSelection()?.removeAllRanges();

    return (
      browserWindow.find?.(query, false, false, true, false, false, false) ??
      document.body.innerText.includes(query)
    );
  }, text);

const collapseDOMSelectionToTextEnd = async (
  text: Locator,
  selection: {
    anchor: { path: number[]; offset: number };
    focus: { path: number[]; offset: number };
  }
) => {
  await text.evaluate((element: HTMLElement, nextSelection) => {
    const root = element.closest(
      '[data-plite-editor="true"]'
    ) as HTMLElement | null;
    const walker = element.ownerDocument.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT
    );
    let lastText: Node | null = null;
    let current = walker.nextNode();

    while (current) {
      lastText = current;
      current = walker.nextNode();
    }

    if (!root || !lastText) {
      throw new Error('Cannot collapse selection to text end');
    }

    const handle = (root as Record<string, any>).__pliteBrowserHandle;

    handle?.selectRange?.(nextSelection);
    root.focus();

    const selection = element.ownerDocument.getSelection();

    if (!selection) {
      throw new Error('Cannot access document selection');
    }

    selection.removeAllRanges();
    selection.collapse(lastText, lastText.textContent?.length ?? 0);
    element.ownerDocument.dispatchEvent(
      new Event('selectionchange', { bubbles: true })
    );
  }, selection);
};

test.describe('dom coverage boundaries example', () => {
  test.describe.configure({ mode: 'serial' });

  test('keeps hidden content out of native find until materialized', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });

    await expect(editor.root).toContainText('Outer body collapsed');
    await expect(editor.root).not.toContainText('Hidden alpha');
    await expect.poll(() => findRenderedText(page, 'Hidden alpha')).toBe(false);

    await page.getByRole('button', { name: 'Outer' }).click();

    await expect(editor.root).toContainText('Hidden alpha');
    await expect.poll(() => findRenderedText(page, 'Hidden alpha')).toBe(true);
  });

  test('exposes deterministic placeholders for hidden root and child boundaries', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });

    const placeholders = editor.root.locator(
      '[data-plite-dom-coverage-boundary]'
    );

    await expect(placeholders).toHaveCount(3);
    await expect(placeholders.nth(0)).toContainText('Header hidden');
    await expect(placeholders.nth(1)).toContainText('Outer body collapsed');
    await expect(placeholders.nth(2)).toContainText('Footer hidden');
    await expect(placeholders.nth(0)).toHaveAttribute(
      'data-plite-dom-coverage-edge',
      'owner'
    );
    await expect(placeholders.nth(1)).toHaveAttribute(
      'data-plite-dom-coverage-edge',
      'anchor'
    );
    await expect(placeholders.nth(0)).toHaveAttribute(
      'contenteditable',
      'false'
    );
    await expect(placeholders.nth(1)).toHaveAttribute(
      'contenteditable',
      'false'
    );
    await expect(
      editor.root.getByRole('note', { name: 'Hidden header placeholder' })
    ).toBeVisible();
    await expect(
      editor.root.getByRole('note', { name: 'Collapsed outer section body' })
    ).toBeVisible();
    await expect(
      editor.root.getByRole('note', { name: 'Hidden footer placeholder' })
    ).toBeVisible();
  });

  test('copies selected hidden content through model-backed clipboard data', async ({
    page,
  }) => {
    await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });

    await page.getByRole('button', { name: 'Select hidden body' }).click();
    await page.getByRole('button', { name: 'Copy' }).click();

    const copyPreview = page.locator('pre').last();

    await expect(copyPreview).toContainText('text/plain: Hidden alpha');
    await expect(copyPreview).toContainText('fragment: present');
  });

  test('copies select-all content through model-backed covered ranges', async ({
    page,
  }) => {
    await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });

    await page.getByRole('button', { name: 'Select all' }).click();
    await page.getByRole('button', { name: 'Copy' }).click();

    const copyPreview = page.locator('pre').last();

    await expect(copyPreview).toContainText('Visible introduction');
    await expect(copyPreview).toContainText('Hidden alpha');
    await expect(copyPreview).toContainText('fragment: present');
  });

  test('imports a native drag selection across a boundary placeholder', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const editor = await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });
    const visibleText = editor.root.getByText(
      'Visible introduction before the collapsed section.'
    );
    const placeholder = editor.root.getByText('Outer body collapsed');
    const start = await visibleText.boundingBox();
    const end = await placeholder.boundingBox();

    if (!start || !end) {
      throw new Error('Cannot resolve drag targets for DOM coverage example');
    }

    await page.mouse.move(start.x + 4, start.y + start.height / 2);
    await page.mouse.down();
    await page.mouse.move(end.x + end.width - 2, end.y + end.height / 2, {
      steps: 12,
    });
    await page.mouse.up();

    await expect.poll(() => pageErrors).toEqual([]);
    await expect.poll(() => editor.selection.get()).not.toBeNull();

    const selection = await editor.selection.get();
    const selectedPaths = [
      selection?.anchor.path.join('.'),
      selection?.focus.path.join('.'),
    ].sort();

    expect(selectedPaths).toEqual(['1.0', '2.1.0']);
  });

  test('imports a native drag selection from a list item to a boundary placeholder', async ({
    page,
  }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    const editor = await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });

    await page.getByRole('button', { name: 'Outer' }).click();

    const listItem = editor.root.getByText('Hidden list item');
    const footerPlaceholder = editor.root.getByText('Footer hidden');
    const start = await listItem.boundingBox();
    const end = await footerPlaceholder.boundingBox();

    if (!start || !end) {
      throw new Error('Cannot resolve drag targets for list boundary row');
    }

    await page.mouse.move(
      start.x + start.width / 2,
      start.y + start.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(end.x + end.width - 2, end.y + end.height / 2, {
      steps: 12,
    });
    await page.mouse.up();

    await expect.poll(() => pageErrors).toEqual([]);
    await expect.poll(() => editor.selection.get()).not.toBeNull();

    const selection = await editor.selection.get();
    const selectedPaths = [
      selection?.anchor.path.join('.'),
      selection?.focus.path.join('.'),
    ].sort();

    expect(selectedPaths).toEqual(['2.3.0.0', '4.0']);
  });

  test('keeps hidden model updates out of the DOM but available to model-backed copy', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });

    await page.getByRole('button', { name: 'Update hidden body' }).click();

    await expect(editor.root).not.toContainText(/update-\d+/);

    await page.getByRole('button', { name: 'Select hidden body' }).click();
    await page.getByRole('button', { name: 'Copy' }).click();

    const copyPreview = page.locator('pre').last();

    await expect(copyPreview).toContainText(
      /text\/plain: Hidden alpha update-\d+/
    );
    await expect(copyPreview).toContainText('fragment: present');
  });

  test('commits IME composition while DOM coverage boundaries are hidden', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'desktop IME proof only');

    const editor = await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });
    const text = 'Section summary stays mounted.';

    await collapseDOMSelectionToTextEnd(editor.root.getByText(text), {
      anchor: { path: [2, 0, 0], offset: text.length },
      focus: { path: [2, 0, 0], offset: text.length },
    });

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [2, 0, 0], offset: text.length },
        focus: { path: [2, 0, 0], offset: text.length },
      });

    await editor.ime.compose({
      committedText: 'すし',
      steps: ['す', 'すし'],
      text: 'すし',
    });

    await expect(editor.root.getByText(`${text}すし`)).toBeVisible();
    await expect(editor.root).toContainText('Outer body collapsed');
  });

  test('mobile touch near hidden first and last root boundaries stays usable', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile touch proof only');

    const editor = await openExample(page, 'plite/dom-coverage-boundaries', {
      ready: {
        editor: 'visible',
        text: /Outer body collapsed/,
      },
    });
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.getByText('Header hidden').tap();
    await page.getByText('Footer hidden').tap();
    await page.getByRole('button', { name: 'Header' }).tap();
    await page.getByRole('button', { name: 'Footer' }).tap();

    await expect(editor.root).toContainText('Hidden header text');
    await expect(editor.root).toContainText('Hidden footer text');
    await expect.poll(() => pageErrors).toEqual([]);
  });
});
