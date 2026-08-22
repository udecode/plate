import { expect, type Locator, type Page, test } from '@playwright/test';

const recordRuntimeErrors = (page: Page) => {
  const errors: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPageError = (error: Error) => {
    errors.push(error.stack ?? error.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    assertNone: () => expect(errors).toEqual([]),
    reset: () => {
      errors.length = 0;
    },
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
};

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
  const runtimeErrors = recordRuntimeErrors(page);
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
