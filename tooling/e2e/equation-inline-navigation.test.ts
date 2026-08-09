import { expect, type Page, type Request, test } from '@playwright/test';

const recordInteractionErrors = (page: Page) => {
  const errors: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPageError = (error: Error) => {
    errors.push(error.stack ?? error.message);
  };
  const onRequestFailed = (request: Request) => {
    errors.push(
      `${request.method()} ${request.url()}: ${request.failure()?.errorText ?? 'request failed'}`
    );
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);
  page.on('requestfailed', onRequestFailed);

  return {
    assertNone: () => expect(errors).toEqual([]),
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
      page.off('requestfailed', onRequestFailed);
    },
  };
};

test.describe('inline equation keyboard navigation', () => {
  test('closes the popover and places the caret before the equation', async ({
    page,
  }) => {
    let interactionErrors: ReturnType<typeof recordInteractionErrors> | null =
      null;

    try {
      await page.goto('/blocks/equation-demo');

      const editor = page.locator(
        '[data-plite-editor="true"][contenteditable="true"]'
      );
      const equationButton = page
        .getByRole('button', { name: 'Edit equation' })
        .first();

      await expect(editor).toHaveCount(1);
      await expect(equationButton).toBeVisible();
      interactionErrors = recordInteractionErrors(page);

      const equationPath = await equationButton
        .locator('xpath=ancestor::*[@data-plite-path][1]')
        .getAttribute('data-plite-path');

      expect(equationPath).not.toBeNull();

      const path = equationPath!.split(',').map(Number);
      const expectedCaretPath = [...path.slice(0, -1), path.at(-1)! - 1].join(
        ','
      );

      const input = page.getByPlaceholder('E = mc^2');

      await equationButton.click();

      if (!(await input.isVisible())) {
        await equationButton.click();
      }

      await expect(input).toBeVisible();
      await expect(input).toBeFocused();

      await page.keyboard.press('ArrowLeft');
      await expect
        .poll(() =>
          input.evaluate((element) => ({
            end: (element as HTMLTextAreaElement).selectionEnd,
            start: (element as HTMLTextAreaElement).selectionStart,
          }))
        )
        .toEqual({ end: 0, start: 0 });

      await page.keyboard.press('ArrowLeft');

      await expect(input).toBeHidden();
      await expect
        .poll(() =>
          editor.evaluate((element) => {
            const selection = document.getSelection();
            const anchor =
              selection?.anchorNode?.nodeType === Node.ELEMENT_NODE
                ? (selection.anchorNode as Element)
                : selection?.anchorNode?.parentElement;
            const pathElement = anchor?.closest('[data-plite-path]');

            return {
              collapsed: selection?.isCollapsed,
              path: pathElement?.getAttribute('data-plite-path'),
              rootFocused: document.activeElement === element,
            };
          })
        )
        .toEqual({
          collapsed: true,
          path: expectedCaretPath,
          rootFocused: true,
        });
      interactionErrors.assertNone();
    } finally {
      interactionErrors?.stop();
    }
  });
});
