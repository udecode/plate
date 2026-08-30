import { expect, type Locator, test } from '@playwright/test';
import {
  openExample,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/test/playwright';

const mobileProxyProjects = new Set(['mobile-webkit']);

const dispatchBeforeInput = async (
  root: Locator,
  {
    caretOffset,
    endOffset,
    inputType,
    sourceText,
    startOffset,
  }: {
    caretOffset: number;
    endOffset: number;
    inputType: 'deleteContentBackward' | 'insertParagraph';
    sourceText: string;
    startOffset: number;
  }
) =>
  root.evaluate(
    (
      element: HTMLElement,
      { caretOffset, endOffset, inputType, sourceText, startOffset }
    ) => {
      const walker = element.ownerDocument.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
      );
      let textNode: Node | null = null;

      while (walker.nextNode()) {
        if (walker.currentNode.textContent?.includes(sourceText)) {
          textNode = walker.currentNode;
          break;
        }
      }

      if (!textNode) {
        throw new Error(`Mobile input proxy text node not found: ${sourceText}`);
      }

      const selection = element.ownerDocument.getSelection();
      const range = element.ownerDocument.createRange();
      range.setStart(textNode, caretOffset);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);

      const event = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: null,
        inputType,
      }) as InputEvent & { getTargetRanges: () => StaticRange[] };

      Object.defineProperty(event, 'getTargetRanges', {
        value: () => [
          new StaticRange({
            endContainer: textNode,
            endOffset,
            startContainer: textNode,
            startOffset,
          }),
        ],
      });
      element.dispatchEvent(event);

      return event.defaultPrevented;
    },
    { caretOffset, endOffset, inputType, sourceText, startOffset }
  );

test.describe('synthetic mobile beforeinput proxy', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      !mobileProxyProjects.has(testInfo.project.name),
      'Focused synthetic mobile WebKit transport proof only'
    );
    await page.goto('/examples/plite/plaintext');
  });

  test('applies beforeinput-only paragraph insertion once', async ({ page }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/plaintext', {
      ready: { editor: 'visible' },
    });

    try {
      await editor.root.tap();
      await editor.selection.selectAll();
      await editor.insertText('alpha');

      const traceStart = (await editor.get.kernelTrace()).length;
      expect(
        await dispatchBeforeInput(editor.root, {
          caretOffset: 2,
          endOffset: 2,
          inputType: 'insertParagraph',
          sourceText: 'alpha',
          startOffset: 2,
        })
      ).toBe(true);

      await editor.assert.blockTexts(['al', 'pha']);
      await editor.assert.collapsedModelDOMSelection({
        offset: 0,
        path: [1, 0],
        text: 'pha',
      });
      await editor.assert.focusOwner('editor');

      const trace = (await editor.get.kernelTrace()).slice(traceStart);
      expect(
        trace.filter(
          (entry) =>
            entry.eventFamily === 'beforeinput' &&
            entry.command?.kind === 'insert-break'
        )
      ).toHaveLength(1);

      await page.keyboard.insertText('!');
      await editor.assert.blockTexts(['al', '!pha']);
      await editor.assert.collapsedModelDOMSelection({
        offset: 1,
        path: [1, 0],
        text: '!pha',
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('applies repeated beforeinput-only Backspace once per target range', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/plaintext', {
      ready: { editor: 'visible' },
    });

    try {
      await editor.root.tap();
      await editor.selection.selectAll();
      await editor.insertText('abc');

      const traceStart = (await editor.get.kernelTrace()).length;
      expect(
        await dispatchBeforeInput(editor.root, {
          caretOffset: 3,
          endOffset: 3,
          inputType: 'deleteContentBackward',
          sourceText: 'abc',
          startOffset: 2,
        })
      ).toBe(true);
      expect(
        await dispatchBeforeInput(editor.root, {
          caretOffset: 2,
          endOffset: 2,
          inputType: 'deleteContentBackward',
          sourceText: 'ab',
          startOffset: 1,
        })
      ).toBe(true);

      await editor.assert.blockTexts(['a']);
      await editor.assert.collapsedModelDOMSelection({
        offset: 1,
        path: [0, 0],
        text: 'a',
      });
      await editor.assert.focusOwner('editor');

      const trace = (await editor.get.kernelTrace()).slice(traceStart);
      expect(
        trace.filter(
          (entry) =>
            entry.eventFamily === 'beforeinput' && entry.intent === 'delete'
        )
      ).toHaveLength(2);

      await page.keyboard.insertText('!');
      await editor.assert.blockTexts(['a!']);
      await editor.assert.collapsedModelDOMSelection({
        offset: 2,
        path: [0, 0],
        text: 'a!',
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
