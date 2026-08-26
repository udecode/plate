import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';
import { expect, test } from '@playwright/test';

test('huge document mounts both editors with the current heading schema', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/docs/examples/huge-document', {
      waitUntil: 'commit',
    });

    const platePane = page.locator('section').filter({
      has: page.getByRole('heading', { exact: true, name: 'Plate' }),
    });
    const slatePane = page.locator('section').filter({
      has: page.getByRole('heading', {
        exact: true,
        name: 'Upstream Slate',
      }),
    });

    await expect(platePane.locator('[contenteditable="true"]')).toBeVisible();
    await expect(slatePane.locator('[contenteditable="true"]')).toBeVisible();
    await expect(platePane.locator('h1').first()).toBeVisible();
    await expect(slatePane.locator('h1').first()).toBeVisible();

    const paragraph = platePane.locator('p').last();

    await paragraph.click();
    await page.keyboard.press('End');
    await page.keyboard.type('huge-document-probe');
    await expect(paragraph).toContainText('huge-document-probe');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
