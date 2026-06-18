import { expect, test } from '@playwright/test';
import { recordSlateBrowserRuntimeErrors } from '@platejs/browser/playwright';

test.describe('example navigation metadata', () => {
  test('renders only current-state alpha badges', async ({ page }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      await page.goto('/examples/slate');

      const navigation = page.locator('[data-slate-example-link]');

      await expect.poll(() => navigation.count()).toBeGreaterThan(0);
      await expect(
        page.locator('[data-slate-example-link]').filter({ hasText: 'alpha' })
      ).toHaveCount(1);
      await expect(
        page.locator('[data-slate-example-link="pagination"]')
      ).toContainText('alpha');
      await expect(page.getByText('New', { exact: true })).toHaveCount(0);
      await expect(
        page.locator('[data-slate-example-link="comment-mode"]')
      ).not.toContainText('alpha');

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
