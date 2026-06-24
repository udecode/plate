import { expect, test } from '@playwright/test';
import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';

test.describe('yjs collaboration example', () => {
  test('mounts peer editors and local collaboration controls', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      await page.goto('/examples/plite/yjs-collaboration');

      await expect(page.locator('[contenteditable="true"]')).toHaveCount(4);
      await expect(page.getByTestId('yjs-peer-a-append')).toBeVisible();
      await expect(page.getByTestId('yjs-peer-a-insert-text')).toBeVisible();
      await page.getByTestId('yjs-peer-a-insert-text').click();
      await expect(
        page.locator('[contenteditable="true"]').first()
      ).toContainText('!');

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
