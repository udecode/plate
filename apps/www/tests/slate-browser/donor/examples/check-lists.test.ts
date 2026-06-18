import { expect, test } from '@playwright/test';
import { openExample } from '@platejs/browser/playwright';

test.describe('Check-lists example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/slate/check-lists');
  });

  test('checks the bullet when clicked', async ({ page }) => {
    const slateNodeElement = 'div[data-slate-node="element"]';

    await expect(page.locator(slateNodeElement).nth(3)).toHaveText(
      'Criss-cross!'
    );

    await expect(
      page.locator(slateNodeElement).nth(3).locator('span').nth(1)
    ).toHaveCSS('text-decoration-line', 'line-through');

    // Unchecking the checkboxes should un-cross the corresponding text.
    await page
      .locator(slateNodeElement)
      .nth(3)
      .locator('span')
      .nth(0)
      .locator('input')
      .uncheck();
    await expect(page.locator(slateNodeElement).nth(3)).toHaveText(
      'Criss-cross!'
    );
    await expect(
      page.locator(slateNodeElement).nth(3).locator('span').nth(1)
    ).toHaveCSS('text-decoration-line', 'none');

    await expect(page.locator('p[data-slate-node="element"]')).toHaveCount(2);
  });

  test('keeps selection through focus on checkbox inside checklist item', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/check-lists', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [3, 0], offset: 0 });

    const checkbox = editor.locator.block([3]).locator('input');
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await editor.assert.selection({
      anchor: { path: [3, 0], offset: 0 },
      focus: { path: [3, 0], offset: 0 },
    });

    if (testInfo.project.name === 'mobile') {
      await editor.insertText('Still ');
    } else {
      await editor.type('Still ');
    }

    await expect(editor.locator.block([3])).toContainText('Still Criss-cross.');
    await editor.assert.selection({
      anchor: { path: [3, 0], offset: 'Still '.length },
      focus: { path: [3, 0], offset: 'Still '.length },
    });
  });

  test('turns a checklist item into a paragraph on Backspace at item start', async ({
    browserName,
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'slate/check-lists', {
      ready: { editor: 'visible' },
    });

    await expect(page.locator('p[data-slate-node="element"]')).toHaveCount(2);

    await editor.selection.collapse({ path: [3, 0], offset: 0 });
    await editor.focus();
    await editor.root.press('Backspace');

    await expect(page.locator('p[data-slate-node="element"]')).toHaveCount(3);
    await expect(editor.locator.block([3])).toContainText('Criss-cross.');
    if (browserName === 'chromium' || testInfo.project.name === 'mobile') {
      await editor.assert.selection({
        anchor: { path: [3, 0], offset: 0 },
        focus: { path: [3, 0], offset: 0 },
      });
    }
  });
});
