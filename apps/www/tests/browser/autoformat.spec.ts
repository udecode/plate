import { expect, test } from '@playwright/test';
import {
  createPliteBrowserEditorHarness,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

const CASE_ID = 'autoformat:text-substitution-native-input';
const INTRO_TEXT =
  'Empower your writing experience by enabling autoformatting features. Add Markdown-like shortcuts that automatically apply formatting as you type.';
const ROUTE = '/blocks/autoformat-demo';

test(CASE_ID, async ({ page }, testInfo) => {
  expect(testInfo.retry).toBe(0);

  const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

  try {
    await page.goto(ROUTE, { waitUntil: 'commit' });

    const root = page
      .locator('[data-plite-editor="true"][contenteditable="true"]')
      .first();
    const editor = createPliteBrowserEditorHarness(page, CASE_ID, root);

    await editor.ready({ editor: 'visible', text: INTRO_TEXT });

    const blockTexts = await editor.get.modelBlockTexts();
    const blockIndex = blockTexts.indexOf(INTRO_TEXT);

    expect(blockIndex).toBeGreaterThanOrEqual(0);

    const path = [blockIndex, 0];
    const initialOffset = INTRO_TEXT.length;

    await editor.selection.collapse({ offset: initialOffset, path });
    await editor.focus();
    await editor.assert.collapsedModelDOMSelection({
      offset: initialOffset,
      path,
      text: INTRO_TEXT,
    });
    await editor.assert.focusOwner('editor');

    await page.keyboard.type(' ->');

    const substitutedText = `${INTRO_TEXT} →`;

    await editor.assert.modelBlockText(blockIndex, substitutedText);
    await editor.assert.renderedBlockText(blockIndex, substitutedText);
    await editor.assert.collapsedModelDOMSelection({
      offset: substitutedText.length,
      path,
      text: substitutedText,
    });
    await editor.assert.focusOwner('editor');

    await page.keyboard.type('x');

    const finalText = `${substitutedText}x`;

    await editor.assert.modelBlockText(blockIndex, finalText);
    await editor.assert.renderedBlockText(blockIndex, finalText);
    await editor.assert.collapsedModelDOMSelection({
      offset: finalText.length,
      path,
      text: finalText,
    });
    await editor.assert.focusOwner('editor');
    runtimeErrors.assertNone();
  } finally {
    runtimeErrors.stop();
  }
});
