import { expect, test } from '@playwright/test';
import { recordSlateBrowserRuntimeErrors } from '@platejs/browser/playwright';

test.describe('yjs hocuspocus example', () => {
  test('mounts provider-backed peer editors and controls', async ({ page }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      await page.goto('/examples/slate/yjs-hocuspocus?peer=a');

      await expect(page.locator('[contenteditable="true"]')).toHaveCount(1);
      await expect(page.getByTestId('yjs-peer-a-append')).toBeVisible();
      await expect(page.getByTestId('yjs-peer-a-connect')).toBeVisible();
      await expect(page.getByTestId('yjs-peer-a-disconnect')).toBeVisible();

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
