import { expect, test } from '@playwright/test';
import { BROWSER_HANDLE_KEY, recordBrowserRuntimeErrors } from '@platejs/test/playwright';

test.describe('iframe editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/plite/iframe');
  });

  test('should be editable', async ({ page }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const textbox = page
      .frameLocator('iframe')
      .locator('body')
      .getByRole('textbox');

    try {
      await textbox.evaluate((element: HTMLElement, key) => {
        const handle = (element as Record<string, any>)[key];

        if (!handle?.selectRange || !handle?.insertText) {
          throw new Error('Missing Plite browser handle');
        }

        handle.selectRange({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
        handle.insertText('Hello World');
      }, BROWSER_HANDLE_KEY);
      await expect(textbox).toContainText('Hello World');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('clicks mounted iframe content without DOM node resolution errors', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const frame = page.frameLocator('iframe');
    const textbox = frame.locator('body').getByRole('textbox');
    const firstParagraph = textbox
      .locator('[data-editor-node="element"]')
      .first();

    try {
      await firstParagraph.click();

      await expect
        .poll(() =>
          textbox.evaluate((element: HTMLElement) => {
            const selection = element.ownerDocument.getSelection();

            return Boolean(
              selection?.anchorNode && element.contains(selection.anchorNode)
            );
          })
        )
        .toBe(true);

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('applies parent toolbar formatting to selected iframe text', async ({
    page,
  }) => {
    const runtimeErrors = recordBrowserRuntimeErrors(page);
    const frame = page.frameLocator('iframe');
    const textbox = frame.locator('body').getByRole('textbox');

    try {
      await textbox.evaluate((element: HTMLElement, key) => {
        const handle = (element as Record<string, any>)[key];
        const mediaQueries = Array.from(
          element.querySelectorAll('[data-editor-string="true"]')
        ).find((node) => node.textContent === 'media queries');
        const textNode = mediaQueries?.firstChild;

        if (!handle?.selectRange || !textNode) {
          throw new Error('Missing iframe selection target');
        }

        handle.selectRange({
          anchor: { path: [1, 1], offset: 0 },
          focus: { path: [1, 1], offset: 'media queries'.length },
        });
        element.focus();

        const range = element.ownerDocument.createRange();
        range.setStart(textNode, 0);
        range.setEnd(textNode, 'media queries'.length);

        const selection = element.ownerDocument.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        element.ownerDocument.dispatchEvent(
          new Event('selectionchange', { bubbles: true })
        );
      }, BROWSER_HANDLE_KEY);

      await page.getByRole('button', { name: 'Bold' }).click();

      await expect(
        textbox.locator('strong').filter({ hasText: 'media queries' })
      ).toHaveCount(0);
      await expect(textbox).toContainText('media queries');
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
