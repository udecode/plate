import { expect, type Page, test } from '@playwright/test';

const recordRuntimeErrors = (page: Page) => {
  const errors: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPageError = (error: Error) => {
    errors.push(error.stack ?? error.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    assertNone: () => expect(errors).toEqual([]),
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
};

const getTopLevelBlockIds = (page: Page) =>
  page.locator('[data-plite-path]').evaluateAll((elements) =>
    elements
      .filter((element) => {
        const path = element.getAttribute('data-plite-path');

        return (
          !!path &&
          [...path].every((character) => character >= '0' && character <= '9')
        );
      })
      .map((element) => element.getAttribute('data-block-id'))
  );

test.describe('homepage block drag', () => {
  test('moves a block without breaking follow-up editing', async ({ page }) => {
    const runtimeErrors = recordRuntimeErrors(page);
    const editor = page.locator(
      '[data-plite-editor="true"][contenteditable="true"]'
    );
    const welcomeBlock = page.locator('[data-block-id="static-0001"]');
    const initialIntroBlock = page.locator('[data-plite-path="1"]');

    try {
      await page.goto('/');
      await expect(editor).toHaveCount(1);
      await expect(welcomeBlock).toHaveText('Welcome to the Plate Playground!');
      await expect(initialIntroBlock).toContainText(
        'Experience a modern rich-text editor built with'
      );
      const introBlockId =
        await initialIntroBlock.getAttribute('data-block-id');

      expect(introBlockId).not.toBeNull();
      const introBlock = page.locator(`[data-block-id="${introBlockId}"]`);

      await welcomeBlock.hover();
      const dragHandle = page
        .locator('.plite-blockWrapper')
        .filter({ has: welcomeBlock })
        .locator('..')
        .getByRole('button', { name: 'Drag block' });
      const introBox = await introBlock.boundingBox();

      if (!introBox) throw new Error('Expected a visible intro block');

      await dragHandle.dragTo(introBlock, {
        targetPosition: {
          x: introBox.width / 2,
          y: introBox.height * 0.84,
        },
      });

      await expect
        .poll(async () => (await getTopLevelBlockIds(page)).slice(0, 2))
        .toEqual([introBlockId, 'static-0001']);
      runtimeErrors.assertNone();

      await welcomeBlock.click();
      await page.keyboard.press('End');
      await page.keyboard.type('!');
      await expect(welcomeBlock).toHaveText(
        'Welcome to the Plate Playground!!'
      );

      await page.keyboard.press('Shift+ArrowLeft');
      await expect
        .poll(() =>
          welcomeBlock.evaluate((element) => {
            const selection = document.getSelection();

            return {
              anchorInside:
                !!selection?.anchorNode &&
                element.contains(selection.anchorNode),
              focusInside:
                !!selection?.focusNode && element.contains(selection.focusNode),
              text: selection?.toString(),
            };
          })
        )
        .toEqual({ anchorInside: true, focusInside: true, text: '!' });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
