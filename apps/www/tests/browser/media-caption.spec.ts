import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';
import { expect, test } from '@playwright/test';

const CASE_ID = 'media-caption:file-selection-to-toc-navigation';
const EDITOR = '[data-plite-editor="true"][contenteditable="true"]';

test('media resize handles remain visible over the image caption', async ({
  page,
}) => {
  await page.goto('/blocks/editor-ai', { waitUntil: 'commit' });
  const editor = page.locator(EDITOR).first();
  const harness = createPliteBrowserEditorHarness(
    page,
    'media-caption:resize-hover',
    editor
  );
  await harness.ready({ editor: 'visible', text: 'sample.pdf' });
  const figure = editor
    .locator('figure')
    .filter({ has: page.locator('img') })
    .first();
  await figure.locator('img').click();
  const caption = figure.locator('figcaption');
  await expect(caption).toBeVisible();
  const handles = figure.getByLabel('Resize media');
  await expect(handles).toHaveCount(2);
  const opacities = () =>
    handles.evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element, '::after').opacity)
    );

  await page.mouse.move(0, 0);
  await expect.poll(opacities).toEqual(['0', '0']);
  await caption.hover();
  await expect.poll(opacities).toEqual(['1', '1']);
  await figure.locator('img').hover();
  await expect.poll(opacities).toEqual(['1', '1']);
  await page.mouse.move(0, 0);
  await expect.poll(opacities).toEqual(['0', '0']);
});

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
