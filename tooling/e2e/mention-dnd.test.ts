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

test('drags the seeded Alice mention across inline text', async ({ page }) => {
  const runtimeErrors = recordRuntimeErrors(page);
  const editor = page.locator(
    '[data-plite-editor="true"][contenteditable="true"]'
  );
  const mention = editor.locator('[data-plite-value="Alice"]');
  const paragraph = editor.locator('[data-block-id="static-0037"]');
  const targetText = paragraph.locator('[data-plite-path="12,6"]');

  try {
    await page.goto('/');
    await expect(mention).toBeVisible();
    await mention.scrollIntoViewIfNeeded();

    const mentionBox = await mention.boundingBox();
    const getTargetBox = () =>
      targetText.evaluate((element) => {
        const range = document.createRange();

        range.selectNodeContents(element);

        const rects = Array.from(range.getClientRects());
        const rect = rects.at(-1);

        return rect
          ? {
              height: rect.height,
              width: rect.width,
              x: rect.x,
              y: rect.y,
            }
          : null;
      });

    if (!mentionBox) {
      throw new Error('Expected visible mention drag geometry');
    }

    const start = {
      x: mentionBox.x + mentionBox.width / 2,
      y: mentionBox.y + mentionBox.height / 2,
    };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 10, start.y, { steps: 4 });

    const targetBox = await getTargetBox();

    if (!targetBox) {
      throw new Error('Expected visible mention drop geometry');
    }

    const end = {
      x: targetBox.x + targetBox.width - 2,
      y: targetBox.y + targetBox.height / 2,
    };

    await page.mouse.move(end.x, end.y, { steps: 12 });

    const dropCursor = editor.locator('[data-plite-drop-cursor]');

    await expect(dropCursor).toBeVisible();
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');

    await page.mouse.up();

    await expect(mention).toHaveCount(1);
    await expect
      .poll(async () => {
        const text = (await paragraph.textContent()) ?? '';

        return text.indexOf('Alice') > text.indexOf('or insert');
      })
      .toBe(true);
    await expect(dropCursor).toHaveCount(0);
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
