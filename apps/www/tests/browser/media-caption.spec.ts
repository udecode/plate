import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const CASE_ID = 'media-caption:file-selection-to-toc-navigation';
const EDITOR = '[data-plite-editor="true"][contenteditable="true"]';

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });

    const editor = page.locator(EDITOR).first();
    const editorHarness = createPliteBrowserEditorHarness(
      page,
      CASE_ID,
      editor
    );

    await editorHarness.ready({ editor: 'visible', text: 'sample.pdf' });

    const initialBlocks = await editorHarness.get.modelBlockTexts();
    const mediaHeadingIndex = initialBlocks.indexOf('Images and Media');

    expect(mediaHeadingIndex).toBeGreaterThanOrEqual(0);

    const file = editor.getByRole('link', {
      name: 'sample.pdf',
      exact: true,
    });
    const mediaHeading = editor
      .locator('h3')
      .filter({ hasText: 'Images and Media' })
      .first();
    const tocItem = editor.getByRole('button', {
      name: 'Images and Media',
      exact: true,
    });

    await file.click();
    await tocItem.click();

    runtimeErrors.assertNone();
    await expect(editor).toBeVisible();
    await expect(mediaHeading).toBeVisible();

    const headingText = mediaHeading.locator('[data-plite-string="true"]');
    const headingBox = await headingText.boundingBox();

    expect(headingBox).not.toBeNull();
    await headingText.click({
      position: {
        x: Math.max(1, (headingBox?.width ?? 1) - 1),
        y: Math.max(1, (headingBox?.height ?? 1) / 2),
      },
    });
    await expect(editor).toBeFocused();
    await expect
      .poll(() =>
        headingText.evaluate((element) => {
          const selection = getSelection();

          return {
            collapsed: selection?.isCollapsed ?? false,
            inside: Boolean(
              selection?.anchorNode && element.contains(selection.anchorNode)
            ),
          };
        })
      )
      .toEqual({ collapsed: true, inside: true });
    await page.keyboard.type('!');

    await expect(mediaHeading).toHaveText('Images and Media!');
    await editorHarness.assert.modelBlockText(
      mediaHeadingIndex,
      'Images and Media!'
    );
    await page.keyboard.press('ControlOrMeta+z');
    await expect(mediaHeading).toHaveText('Images and Media');
    await editorHarness.assert.modelBlockText(
      mediaHeadingIndex,
      'Images and Media'
    );
  } finally {
    runtimeErrors.stop();
  }
});
