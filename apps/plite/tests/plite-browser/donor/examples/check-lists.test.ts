import { expect, test } from '@playwright/test';
import { openExample } from '@platejs/test/playwright';

test.describe('Check-lists example', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/plite/check-lists');
  });

  test('checks the bullet when clicked', async ({ page }) => {
    const pliteNodeElement = 'div[data-plite-node="element"]';

    await expect(page.locator(pliteNodeElement).nth(3)).toHaveText(
      'Criss-cross!'
    );

    await expect(
      page.locator(pliteNodeElement).nth(3).locator('span').nth(1)
    ).toHaveCSS('text-decoration-line', 'line-through');

    // Unchecking the checkboxes should un-cross the corresponding text.
    await page
      .locator(pliteNodeElement)
      .nth(3)
      .locator('span')
      .nth(0)
      .locator('input')
      .uncheck();
    await expect(page.locator(pliteNodeElement).nth(3)).toHaveText(
      'Criss-cross!'
    );
    await expect(
      page.locator(pliteNodeElement).nth(3).locator('span').nth(1)
    ).toHaveCSS('text-decoration-line', 'none');

    await expect(page.locator('p[data-plite-node="element"]')).toHaveCount(2);
  });

  test('keeps selection through focus on checkbox inside checklist item', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/check-lists', {
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
    const editor = await openExample(page, 'plite/check-lists', {
      ready: { editor: 'visible' },
    });

    await expect(page.locator('p[data-plite-node="element"]')).toHaveCount(2);

    await editor.selection.collapse({ path: [3, 0], offset: 0 });
    await editor.focus();
    await editor.root.press('Backspace');

    await expect(page.locator('p[data-plite-node="element"]')).toHaveCount(3);
    await expect(editor.locator.block([3])).toContainText('Criss-cross.');
    if (browserName === 'chromium' || testInfo.project.name === 'mobile') {
      await editor.assert.selection({
        anchor: { path: [3, 0], offset: 0 },
        focus: { path: [3, 0], offset: 0 },
      });
    }
  });

  test('moves document-start navigation to a leading checklist item', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop checklist proof');

    const editor = await openExample(page, 'plite/check-lists', {
      query: { case: 'leading-item' },
      ready: { editor: 'visible', text: 'Finish here.' },
    });
    const documentStartHotkey =
      process.platform === 'darwin' ? 'Meta+ArrowUp' : 'Control+Home';

    await expect(editor.locator.block([0]).locator('input')).toHaveCount(1);
    await expect
      .poll(() => editor.get.modelBlockTexts())
      .toEqual(['Start here.', 'Keep going.', 'Finish here.']);

    await editor.selection.selectDOM({
      anchor: { path: [2, 0], offset: 6 },
      focus: { path: [2, 0], offset: 6 },
    });
    await editor.focus();
    await editor.root.press(documentStartHotkey);

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [0, 0],
      isCollapsed: true,
    });
    await editor.assert.noDoubleSelectionHighlight();
  });
});
