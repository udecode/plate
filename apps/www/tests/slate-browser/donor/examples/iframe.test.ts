import { expect, test } from '@playwright/test';
import { recordSlateBrowserRuntimeErrors } from '@platejs/browser/playwright';

test.describe('iframe editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/slate/iframe');
  });

  test('should be editable', async ({ page }) => {
    const slateErrors: string[] = [];
    page.on('console', (message) => {
      if (
        message.type() === 'error' &&
        message.text().includes('without a DOM coverage boundary')
      ) {
        slateErrors.push(message.text());
      }
    });

    const textbox = page
      .frameLocator('iframe')
      .locator('body')
      .getByRole('textbox');

    await textbox.evaluate((element: HTMLElement) => {
      const handle = (element as Record<string, any>).__slateBrowserHandle;

      if (!handle?.selectRange || !handle?.insertText) {
        throw new Error('Missing Slate browser handle');
      }

      handle.selectRange({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      handle.insertText('Hello World');
    });
    await expect(textbox).toContainText('Hello World');
    await page.waitForTimeout(50);
    expect(slateErrors).toEqual([]);
  });

  test('clicks mounted iframe content without DOM node resolution errors', async ({
    page,
  }) => {
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const frame = page.frameLocator('iframe');
    const textbox = frame.locator('body').getByRole('textbox');
    const firstParagraph = textbox
      .locator('[data-slate-node="element"]')
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
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const frame = page.frameLocator('iframe');
    const textbox = frame.locator('body').getByRole('textbox');

    try {
      await textbox.evaluate((element: HTMLElement) => {
        const handle = (element as Record<string, any>).__slateBrowserHandle;
        const mediaQueries = Array.from(
          element.querySelectorAll('[data-slate-string="true"]')
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
      });

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
