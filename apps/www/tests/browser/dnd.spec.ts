import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const CASE_ID = 'dnd:drag-handle-excluded-from-native-selection';

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/', { waitUntil: 'commit' });
    const harness = createPliteBrowserEditorHarness(
      page,
      CASE_ID,
      page.locator('.plite-editor')
    );
    await harness.ready({ editor: 'visible', text: 'Collaborative Editing' });

    const heading = page.getByRole('heading', {
      name: 'Collaborative Editing',
    });
    const draggable = page.locator('.plite-editor > div').filter({
      has: heading,
    });
    const previousText = draggable
      .locator('xpath=preceding-sibling::*[1]')
      .locator('[data-plite-node="text"]')
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
