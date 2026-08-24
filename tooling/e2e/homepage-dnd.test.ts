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

test.describe('homepage block drag', () => {
  test('moves a block without breaking follow-up editing', async ({ page }) => {
    const runtimeErrors = recordRuntimeErrors(page);
    const editor = page.locator(
      '[data-plite-editor="true"][contenteditable="true"]'
    );
    const welcomeBlock = editor
      .locator('[data-plite-node="element"][data-plite-path]:visible')
      .filter({ hasText: 'Welcome to the Plate Playground!' })
      .first();
    const introBlock = editor
      .locator('[data-plite-node="element"][data-plite-path]:visible')
      .filter({
        hasText: 'Experience a modern rich-text editor built with',
      })
      .first();

    try {
      await page.goto('/');
      await expect(editor).toHaveCount(1);
      await expect(welcomeBlock).toHaveText('Welcome to the Plate Playground!');
      await expect(introBlock).toContainText(
        'Experience a modern rich-text editor built with'
      );
      await page.waitForLoadState('networkidle');

      const dragHandle = welcomeBlock
        .locator('..')
        .locator('..')
        .locator('..')
        .locator('[aria-label="Drag block"]');

      await expect(dragHandle).not.toHaveAttribute('draggable', 'true');
      await welcomeBlock.hover();
      await expect(dragHandle).toBeVisible();
      await dragHandle.hover();
      await expect(dragHandle).toHaveAttribute('draggable', 'true');
      await welcomeBlock.click();

      const dragHandleBox = await dragHandle.boundingBox();
      const introBox = await introBlock.boundingBox();

      if (!dragHandleBox) throw new Error('Expected a visible drag handle');
      if (!introBox) throw new Error('Expected a visible intro block');

      await page.mouse.move(
        dragHandleBox.x + dragHandleBox.width / 2,
        dragHandleBox.y + dragHandleBox.height / 2
      );
      await page.mouse.down();
      try {
        await page.mouse.move(
          introBox.x + introBox.width / 2,
          introBox.y + introBox.height * 0.84,
          { steps: 12 }
        );
        await expect(page.locator('body')).toHaveClass(/\bdragging\b/);
        await expect
          .poll(() =>
            editor.evaluate((element) => {
              const selection = document.getSelection();

              return (
                !!selection?.isCollapsed &&
                !!selection.anchorNode &&
                element.contains(selection.anchorNode)
              );
            })
          )
          .toBe(false);
        await expect(
          editor.locator('[data-plite-drop-cursor]:visible')
        ).toHaveCount(0);
      } finally {
        await page.mouse.up();
      }

      await dragHandle.dragTo(introBlock, {
        targetPosition: {
          x: introBox.width / 2,
          y: introBox.height * 0.84,
        },
      });

      await expect
        .poll(async () => ({
          intro: await introBlock.getAttribute('data-plite-path'),
          welcome: await welcomeBlock.getAttribute('data-plite-path'),
        }))
        .toEqual({ intro: '0', welcome: '1' });
      await expect
        .poll(() =>
          editor.evaluate((element) => {
            const selection = document.getSelection();

            return (
              !!selection?.isCollapsed &&
              !!selection.anchorNode &&
              element.contains(selection.anchorNode)
            );
          })
        )
        .toBe(false);
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
