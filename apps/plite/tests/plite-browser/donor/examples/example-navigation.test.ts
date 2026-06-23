import { expect, test } from '@playwright/test';
import { recordPliteBrowserRuntimeErrors } from '@platejs/browser/playwright';

const newExampleSlugs = [
  'comment-mode',
  'document-state',
  'hidden-content-blocks',
  'linting',
  'multi-root-document',
  'pagination',
  'synced-blocks',
  'yjs-collaboration',
  'yjs-hocuspocus',
];

test.describe('example navigation metadata', () => {
  test('redirects the examples index to rich text', async ({ page }) => {
    await page.goto('/examples/plite');
    await expect(page).toHaveURL(/\/examples\/plite\/richtext$/);
  });

  test('marks only examples that are new versus upstream Slate', async ({
    page,
  }, testInfo) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      await page.goto('/examples/plite/richtext');
      if (testInfo.project.name === 'mobile') {
        await page
          .locator('[data-plite-example-mobile-nav]')
          .evaluate((element: HTMLDetailsElement) => {
            element.open = true;
          });
      }

      const navigation = page.locator('[data-plite-example-nav-link]:visible');

      await expect.poll(() => navigation.count()).toBeGreaterThan(0);
      await expect(
        page.locator('[data-plite-example-new-dot]:visible')
      ).toHaveCount(newExampleSlugs.length);
      for (const slug of newExampleSlugs) {
        await expect(
          page.locator(`[data-plite-example-new-dot="${slug}"]:visible`)
        ).toHaveCount(1);
      }

      await expect(
        page.locator(
          '[data-plite-example-nav-link="richtext"]:visible [data-plite-example-new-dot]'
        )
      ).toHaveCount(0);
      await expect(page.getByText('alpha', { exact: true })).toHaveCount(0);
      await expect(page.getByText('New', { exact: true })).toHaveCount(0);

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
