import { expect, test } from '@playwright/test';
import { openExample } from '@platejs/browser/playwright';

test.describe('readonly editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/plite/read-only');
  });

  test('should not be editable', async ({ page }) => {
    const pliteEditor = '[data-plite-editor="true"]';
    const editor = page.locator(pliteEditor);
    const initialText = await editor.textContent();

    expect(await editor.getAttribute('contentEditable')).toBe('true');
    expect(await editor.getAttribute('aria-readonly')).toBe('true');
    expect(await editor.getAttribute('role')).toBe('textbox');
    await expect(editor).toHaveCSS('caret-color', 'rgba(0, 0, 0, 0)');
    await editor.click();
    await page.keyboard.type('not editable');

    await expect(editor).toBeFocused();
    await expect(editor).toHaveText(initialText ?? '');
  });

  test('renders programmatic selection visually while read-only', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/read-only', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'This example'.length },
    });

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('This example');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'This example'.length },
    });
  });

  test('clicking inside a read-only selection collapses DOM and Plite selection', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop pointer proof');

    const editor = await openExample(page, 'plite/read-only', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'This example'.length },
    });

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('This example');

    const clickPoint = await editor.root.evaluate((root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNode = walker.nextNode();

      if (!textNode) {
        throw new Error('Missing read-only text node');
      }

      const range = document.createRange();
      range.setStart(textNode, 5);
      range.collapse(true);

      const rect = range.getBoundingClientRect();

      return {
        x: rect.left,
        y: rect.top + rect.height / 2,
      };
    });

    await page.mouse.click(clickPoint.x, clickPoint.y);

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');
    await expect
      .poll(async () => {
        const selection = await editor.get.selection();

        return selection
          ? JSON.stringify(selection.anchor) === JSON.stringify(selection.focus)
          : false;
      })
      .toBe(true);
  });

  test('copies programmatic selections while read-only', async ({ page }) => {
    const editor = await openExample(page, 'plite/read-only', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'This example'.length },
    });

    const payload = await editor.clipboard.copyEventPayload();

    expect(payload.text).toBe('This example');
    expect(payload.html).toContain('data-plite-fragment=');
  });
});
