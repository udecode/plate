import {
  createBrowserEditorHarness,
  recordBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const CASE_ID = 'dnd:drag-handle-excluded-from-native-selection';
const PREVIEW_CASE_ID = 'dnd:block-preview-origin';

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const harness = createBrowserEditorHarness(
      page,
      CASE_ID,
      page.locator('.editor-editor')
    );
    await harness.ready({ editor: 'visible', text: 'Collaborative Editing' });

    const heading = page.getByRole('heading', {
      name: 'Collaborative Editing',
    });
    const draggable = page.locator('.editor-editor > div').filter({
      has: heading,
    });
    const previousText = draggable
      .locator('xpath=preceding-sibling::*[1]')
      .locator('[data-editor-node="text"]')
      .last();
    const handle = draggable.getByRole('button', { name: 'Drag block' });

    await heading.scrollIntoViewIfNeeded();

    const start = await previousText.boundingBox();
    const end = await heading.boundingBox();

    expect(start).not.toBeNull();
    expect(end).not.toBeNull();

    await page.mouse.move(
      start!.x + start!.width / 2,
      start!.y + start!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(end!.x + 220, end!.y + end!.height / 2, {
      steps: 8,
    });
    await page.mouse.up();

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString()))
      .toContain('Collaborative Editing');
    expect(
      await page.evaluate(() => window.getSelection()?.toString())
    ).not.toContain('⠿');
    expect(
      await handle.evaluate((element) => getComputedStyle(element).userSelect)
    ).toBe('none');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});

test(PREVIEW_CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  await page.addInitScript(() => {
    const nativeSetDragImage = DataTransfer.prototype.setDragImage;

    DataTransfer.prototype.setDragImage = function setDragImage(image, x, y) {
      const rect = image.getBoundingClientRect();

      Reflect.set(window, '__plateDragImageProbe', {
        childCount: image.childElementCount,
        height: rect.height,
        text: image.textContent,
        top: rect.top,
        width: rect.width,
        x,
        y,
      });

      return nativeSetDragImage.call(this, image, x, y);
    };
  });

  const runtimeErrors = recordBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/playground', { waitUntil: 'commit' });
    const editor = page.locator('.editor-editor');
    const harness = createBrowserEditorHarness(page, PREVIEW_CASE_ID, editor);
    const text =
      'Plate offers many features out-of-the-box as free, open-source plugins.';

    await harness.ready({ editor: 'visible', text });

    const block = editor.locator('.editor-blockWrapper').filter({
      hasText: text,
    });

    await block.scrollIntoViewIfNeeded();
    await block.hover();

    const handle = block
      .locator('xpath=..')
      .getByRole('button', { name: 'Drag block' });

    await handle.hover();

    const handleBox = await handle.boundingBox();
    const blockBox = await block.boundingBox();

    expect(handleBox).not.toBeNull();
    expect(blockBox).not.toBeNull();

    await page.mouse.move(
      handleBox!.x + handleBox!.width / 2,
      handleBox!.y + handleBox!.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(handleBox!.x + 80, handleBox!.y + 20, { steps: 8 });

    await expect
      .poll(() =>
        page.evaluate(
          () =>
            Reflect.get(window, '__plateDragImageProbe') as
              | {
                  childCount: number;
                  height: number;
                  text: string | null;
                  top: number;
                  width: number;
                  x: number;
                  y: number;
                }
              | undefined
        )
      )
      .toMatchObject({
        childCount: 1,
        text: expect.stringContaining(text),
      });
    const preview = await page.evaluate(
      () =>
        Reflect.get(window, '__plateDragImageProbe') as {
          childCount: number;
          height: number;
          text: string | null;
          top: number;
          width: number;
          x: number;
          y: number;
        }
    );

    expect(preview.height).toBeGreaterThan(0);
    expect(preview.width).toBeGreaterThan(0);
    expect(Math.abs(preview.top - blockBox!.y)).toBeLessThan(16);

    await page.mouse.up();
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
