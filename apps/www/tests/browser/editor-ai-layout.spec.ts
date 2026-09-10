import { recordPliteBrowserRuntimeErrors } from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

test('full editor content stays inside its grid column after resizing', async ({
  page,
}, testInfo) => {
  expect(testInfo.retry).toBe(0);
  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto(
      process.env.PLATE_INSTALLED_EDITOR_PROOF === '1'
        ? '/editor'
        : '/blocks/editor-ai'
    );
    const editor = page.locator(
      '[data-plite-editor="true"][contenteditable="true"]:not([aria-label])'
    );
    const heading = editor.getByRole('heading', {
      name: 'Welcome to the Plate Playground!',
      exact: true,
    });
    await expect(heading).toBeVisible();

    const fitsGrid = () =>
      editor.evaluate((element) => {
        const grid = element.closest('.grid');
        if (!grid) throw new Error('Full editor grid is missing');
        const outer = grid.getBoundingClientRect();
        const inner = element.getBoundingClientRect();
        const title = element.querySelector('h1');
        if (!title) throw new Error('Full editor heading is missing');
        const range = document.createRange();
        range.selectNodeContents(title);

        return (
          Math.abs(inner.width - outer.width) <= 1 &&
          inner.left >= outer.left - 1 &&
          inner.right <= outer.right + 1 &&
          [...range.getClientRects()].every(
            (rect) => rect.left >= outer.left && rect.right <= outer.right
          )
        );
      });

    for (let run = 0; run < 5; run++) {
      await page.setViewportSize({ width: 1280, height: 900 });
      await expect.poll(fitsGrid).toBe(true);
      await page.setViewportSize({ width: 433, height: 900 });
      await expect.poll(fitsGrid).toBe(true);
    }

    await page.screenshot({
      path: testInfo.outputPath('editor-ai-narrow.png'),
    });
    await expect.poll(fitsGrid).toBe(true);
    await heading.click();
    await page.keyboard.type(' layout-proof');
    await expect(editor).toContainText(' layout-proof');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
