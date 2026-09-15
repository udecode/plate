import { expect, test } from '@playwright/test';

import { recordBrowserRuntimeErrors } from '../../packages/test/src/playwright/runtime-errors';

test('drags the seeded Alice mention across inline text', async ({ page }) => {
  const runtimeErrors = recordBrowserRuntimeErrors(page, { strict: true });
  const editor = page.locator('[data-editor="true"][contenteditable="true"]');
  const mention = editor.locator('[data-editor-value="Alice"]');
  const paragraph = editor
    .locator('[data-editor-node="element"]:not([data-editor-inline="true"])')
    .filter({ has: page.locator('[data-editor-value="Alice"]') })
    .first();
  const targetText = paragraph
    .locator('[data-editor-node="text"]')
    .filter({ hasText: ', or insert ' })
    .first();

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

    const targetBox = await getTargetBox();

    if (!targetBox) {
      throw new Error('Expected visible mention drop geometry');
    }

    const start = {
      x: mentionBox.x + mentionBox.width / 2,
      y: mentionBox.y + mentionBox.height / 2,
    };
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(start.x + 10, start.y, { steps: 4 });

    const end = {
      x: targetBox.x + targetBox.width - 2,
      y: targetBox.y + targetBox.height / 2,
    };

    await page.mouse.move(end.x, end.y, { steps: 12 });

    const dropCursor = editor.locator('[data-editor-drop-cursor]');

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
