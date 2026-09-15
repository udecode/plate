import { expect, test } from '@playwright/test';
import { recordBrowserRuntimeErrors } from '@platejs/test/playwright';

const newExampleSlugs = [
  'authored-changes',
  'comment-mode',
  'document-state',
  'external-text',
  'hidden-content-blocks',
  'linting',
  'multi-root-document',
  'pagination',
  'synced-blocks',
  'yjs-collaboration',
  'yjs-hocuspocus',
];

test.describe('example navigation metadata', () => {
  for (const [slug, selector] of [
    ['comment-mode', '.editor-comment-mode-panel'],
    ['decorations-async', '.editor-decorations-async-container'],
    ['document-state', '.editor-document-state-panel'],
    ['linting', '.editor-linting-panel'],
    ['multi-root-document', '.editor-multi-root-document-page'],
    ['persistent-annotation-anchors', '.editor-persistent-annotation-anchors-panel'],
  ] as const) {
    test(`keeps the centered ${slug} example inside a narrow viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/examples/plite/${slug}`);
      await expect(page.locator(selector)).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth
          )
        )
        .toBeLessThanOrEqual(1);
    });
  }

  test('redirects the examples index to rich text', async ({ page }) => {
    await page.goto('/examples/plite');
    await expect(page).toHaveURL(/\/examples\/plite\/richtext$/);
  });

  test('marks only examples that are new versus upstream Slate', async ({
    page,
  }, testInfo) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);

    try {
      await page.goto('/examples/plite/richtext');
      if (testInfo.project.name === 'mobile') {
        await page
          .locator('[data-editor-example-mobile-nav]')
          .evaluate((element: HTMLDetailsElement) => {
            element.open = true;
          });
      }

      const navigation = page.locator('[data-editor-example-nav-link]:visible');

      await expect.poll(() => navigation.count()).toBeGreaterThan(0);
      await expect(
        page.locator('[data-editor-example-new-dot]:visible')
      ).toHaveCount(newExampleSlugs.length);
      for (const slug of newExampleSlugs) {
        await expect(
          page.locator(`[data-editor-example-new-dot="${slug}"]:visible`)
        ).toHaveCount(1);
      }

      await expect(
        page.locator(
          '[data-editor-example-nav-link="richtext"]:visible [data-editor-example-new-dot]'
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
