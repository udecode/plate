import { expect, test } from '@playwright/test';

test.describe('forced layout example', () => {
  const elements = [
    { tag: '[data-editor-example="forced-layout"] h2', count: 1 },
    { tag: '[data-editor-example="forced-layout"] p', count: 1 },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/plite/forced-layout');
  });

  test('checks for the elements', async ({ page }) => {
    for (const { tag, count } of elements) {
      await expect(page.locator(tag)).toHaveCount(count);
    }
  });

  test('checks if elements persist even after everything is deleted', async ({
    page,
  }) => {
    const textbox = page.locator('div[role="textbox"]');

    await textbox.click();
    await textbox.press('ControlOrMeta+A');
    await textbox.press('Backspace');

    for (const { tag, count } of elements) {
      await expect(page.locator(tag)).toHaveCount(count);
    }
    await expect(page.locator(elements[0].tag)).toBeEmpty();
    await expect(page.locator(elements[1].tag)).toBeEmpty();

    await textbox.pressSequentially('New title');
    await expect(page.locator(elements[0].tag)).toHaveText('New title');
  });
});
