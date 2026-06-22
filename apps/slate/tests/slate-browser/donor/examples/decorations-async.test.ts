import { expect, type Locator, test } from '@playwright/test';

import { openExample } from '@platejs/browser/playwright';

const INITIAL_TEXT = 'This is some text here about. there';
const INSERTED_TEXT = ' there';
const FINAL_TEXT = `${INITIAL_TEXT}${INSERTED_TEXT}`;
const FINAL_CARET_OFFSET = FINAL_TEXT.length;
const COMPOSED_TEXT = 'xy';
const FINAL_COMPOSED_TEXT = `${FINAL_TEXT}${COMPOSED_TEXT}`;
const FINAL_COMPOSED_CARET_OFFSET = FINAL_COMPOSED_TEXT.length;

const getDOMCaretOffsetInFirstText = async (root: Locator) =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();
    const textElement = element.querySelector(
      '[data-slate-node="text"][data-slate-path="0,0"]'
    );

    if (
      !selection?.isCollapsed ||
      selection.rangeCount === 0 ||
      !selection.anchorNode ||
      !textElement
    ) {
      return null;
    }

    const range = element.ownerDocument.createRange();

    try {
      range.setStart(textElement, 0);
      range.setEnd(selection.anchorNode, selection.anchorOffset);
    } catch {
      return null;
    }

    return {
      offset: range.toString().length,
      text: textElement.textContent,
    };
  });

const getInputState = async (root: Locator) =>
  root.evaluate((element: HTMLElement) => {
    const handle = (element as Record<string, any>).__slateBrowserHandle;

    return handle?.getInputState?.() ?? null;
  });

test.describe('async decorations', () => {
  for (const source of ['prop', 'hook'] as const) {
    test(`keeps the caret at the typed end when delayed ${source} decorations restructure text`, async ({
      page,
    }, testInfo) => {
      const editor = await openExample(page, 'slate/decorations-async', {
        query: source === 'hook' ? { source } : undefined,
        ready: {
          editor: 'visible',
          text: INITIAL_TEXT,
        },
      });

      await expect(
        page.locator('[data-cy="async-decoration-highlight"]')
      ).toHaveCount(2);
      await editor.selection.collapse({
        path: [0, 0],
        offset: INITIAL_TEXT.length,
      });
      await editor.focus();

      if (testInfo.project.name === 'mobile') {
        await editor.insertText(INSERTED_TEXT);
      } else {
        await page.keyboard.type(INSERTED_TEXT);
      }

      await editor.assert.selection({
        anchor: { path: [0, 0], offset: FINAL_CARET_OFFSET },
        focus: { path: [0, 0], offset: FINAL_CARET_OFFSET },
      });
      await expect(
        page.locator('[data-cy="async-decoration-highlight"]')
      ).toHaveCount(2);

      await expect(
        page.locator('[data-cy="async-decoration-highlight"]')
      ).toHaveCount(3);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: FINAL_CARET_OFFSET },
        focus: { path: [0, 0], offset: FINAL_CARET_OFFSET },
      });
      await expect
        .poll(() => getDOMCaretOffsetInFirstText(editor.root))
        .toEqual({
          offset: FINAL_CARET_OFFSET,
          text: FINAL_TEXT,
        });
    });

    test(`keeps ${source} decoration refresh from interrupting active IME composition`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

      const editor = await openExample(page, 'slate/decorations-async', {
        query: source === 'hook' ? { source } : undefined,
        ready: {
          editor: 'visible',
          text: INITIAL_TEXT,
        },
      });

      await expect(
        page.locator('[data-cy="async-decoration-highlight"]')
      ).toHaveCount(2);
      await editor.selection.collapse({
        path: [0, 0],
        offset: INITIAL_TEXT.length,
      });
      await editor.focus();
      await page.keyboard.type(INSERTED_TEXT);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: FINAL_CARET_OFFSET },
        focus: { path: [0, 0], offset: FINAL_CARET_OFFSET },
      });

      await editor.ime.startSynthetic({ text: COMPOSED_TEXT[0] });
      await editor.ime.updateSynthetic({ text: COMPOSED_TEXT });
      await expect
        .poll(async () => (await getInputState(editor.root))?.activeIntent)
        .toBe('composition');

      await expect(
        page.locator('[data-cy="async-decoration-highlight"]')
      ).toHaveCount(3);
      await expect
        .poll(async () => (await getInputState(editor.root))?.activeIntent)
        .toBe('composition');

      await editor.ime.commitSynthetic({ text: COMPOSED_TEXT });

      await editor.assert.blockTexts([FINAL_COMPOSED_TEXT]);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: FINAL_COMPOSED_CARET_OFFSET },
        focus: { path: [0, 0], offset: FINAL_COMPOSED_CARET_OFFSET },
      });
      await editor.assert.kernelTrace({
        eventFamily: 'compositionend',
        transition: { allowed: true },
      });
      await expect
        .poll(() => getDOMCaretOffsetInFirstText(editor.root))
        .toEqual({
          offset: FINAL_COMPOSED_CARET_OFFSET,
          text: FINAL_COMPOSED_TEXT,
        });
    });
  }
});
