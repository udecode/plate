import { expect, type Locator, test } from '@playwright/test';

import { recordPliteBrowserRuntimeErrors } from '../../packages/test/src/playwright/runtime-errors';

const readSelection = async (target: Locator) =>
  target.evaluate((element) => {
    const selection = window.getSelection();
    const { activeElement } = document;

    return {
      activeInEditor:
        activeElement?.getAttribute('contenteditable') === 'true' &&
        activeElement.contains(element),
      anchorOffset: selection?.anchorOffset ?? null,
      collapsed: selection?.isCollapsed ?? false,
      inTarget:
        !!selection?.anchorNode && element.contains(selection.anchorNode),
      text: selection?.toString() ?? '',
    };
  });

test('Tab and Shift+Tab place one caret in the destination table cell (#5065)', async ({
  page,
}) => {
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page, { strict: true });
  const editor = page.locator(
    '[data-plite-editor="true"][contenteditable="true"]'
  );
  const suggestions = editor.getByText('Suggestions', { exact: true });
  const row = suggestions.locator('xpath=ancestor::tr[1]');
  const checkmark = row.getByText('✅', { exact: true });

  try {
    await page.goto('/blocks/playground');
    await expect(editor).toHaveCount(1);
    await expect(suggestions).toBeVisible();
    await expect(checkmark).toBeVisible();
    await page.waitForLoadState('networkidle');
    runtimeErrors.reset();

    await suggestions.click();
    await page.keyboard.press('Tab');

    await expect
      .poll(() => readSelection(checkmark))
      .toEqual({
        activeInEditor: true,
        anchorOffset: 0,
        collapsed: true,
        inTarget: true,
        text: '',
      });

    await page.keyboard.press('Shift+Tab');

    await expect
      .poll(() => readSelection(suggestions))
      .toEqual({
        activeInEditor: true,
        anchorOffset: 0,
        collapsed: true,
        inTarget: true,
        text: '',
      });
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
