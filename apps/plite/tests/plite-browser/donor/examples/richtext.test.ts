import { expect, type Locator, test } from '@playwright/test';
import {
  assertNoIllegalKernelTransitions,
  assertPliteBrowserSelectionContract,
  createPliteBrowserDestructiveEditingGauntlet,
  createPliteBrowserMarkClickTypingGauntlet,
  createPliteBrowserMarkTypingGauntlet,
  createPliteBrowserMixedEditingConformanceGauntlet,
  createPliteBrowserNavigationTypingGauntlet,
  createPliteBrowserSemanticEditingConformanceGauntlet,
  createPliteBrowserToolbarMarkClickTypingGauntlet,
  createPliteBrowserWarmToolbarArrowGauntlet,
  openExample,
  recordPliteBrowserRuntimeErrors,
} from '@platejs/browser/playwright';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3101';
const macChromeUserAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36';

const expectDOMCaretAtTextEnd = async (root: Locator, suffix: string) => {
  await expect
    .poll(() =>
      root.evaluate((element: HTMLElement, expectedSuffix) => {
        const selection = element.ownerDocument.getSelection();

        if (
          !selection?.isCollapsed ||
          !selection.anchorNode ||
          !element.contains(selection.anchorNode)
        ) {
          return false;
        }

        const walker = element.ownerDocument.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT
        );
        let textBeforeCaret = '';

        while (walker.nextNode()) {
          const node = walker.currentNode;
          const text = node.textContent ?? '';

          if (node === selection.anchorNode) {
            textBeforeCaret += text.slice(0, selection.anchorOffset);

            return (
              textBeforeCaret.endsWith(expectedSuffix) &&
              text.slice(selection.anchorOffset).length === 0
            );
          }

          textBeforeCaret += text;
        }

        return false;
      }, suffix)
    )
    .toBe(true);
};

const expectDOMCaretBetweenText = async (
  root: Locator,
  beforeSuffix: string,
  afterPrefix: string
) => {
  await expect
    .poll(() =>
      root.evaluate(
        (
          element: HTMLElement,
          expected: { afterPrefix: string; beforeSuffix: string }
        ) => {
          const selection = element.ownerDocument.getSelection();

          if (
            !selection?.isCollapsed ||
            !selection.anchorNode ||
            !element.contains(selection.anchorNode)
          ) {
            return false;
          }

          const walker = element.ownerDocument.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
          );
          let textBeforeCaret = '';
          let textAfterCaret = '';
          let foundAnchor = false;

          while (walker.nextNode()) {
            const node = walker.currentNode;
            const text = node.textContent ?? '';

            if (node === selection.anchorNode) {
              textBeforeCaret += text.slice(0, selection.anchorOffset);
              textAfterCaret += text.slice(selection.anchorOffset);
              foundAnchor = true;
              continue;
            }

            if (foundAnchor) {
              textAfterCaret += text;
            } else {
              textBeforeCaret += text;
            }
          }

          return (
            foundAnchor &&
            textBeforeCaret.endsWith(expected.beforeSuffix) &&
            textAfterCaret.startsWith(expected.afterPrefix)
          );
        },
        { afterPrefix, beforeSuffix }
      )
    )
    .toBe(true);
};

const getFirstParagraphRightMarginClickPoint = async (root: Locator) =>
  root
    .locator('p')
    .first()
    .evaluate((paragraph: HTMLElement) => {
      const paragraphRect = paragraph.getBoundingClientRect();
      const textRects = Array.from(
        paragraph.querySelectorAll<HTMLElement>('[data-plite-string]')
      ).flatMap((element) => Array.from(element.getClientRects()));

      if (textRects.length === 0) {
        throw new Error('Missing first paragraph text rects');
      }

      const lastLineRect = textRects.reduce((last, rect) => {
        const lowerLine = rect.bottom > last.bottom + 1;
        const sameLineFurtherRight =
          Math.abs(rect.bottom - last.bottom) <= 1 && rect.right > last.right;

        return lowerLine || sameLineFurtherRight ? rect : last;
      }, textRects[0]!);
      const x = Math.min(paragraphRect.right - 8, lastLineRect.right + 80);

      if (x <= lastLineRect.right + 4) {
        throw new Error('First paragraph has no right-margin click space');
      }

      return {
        x,
        y: lastLineRect.top + lastLineRect.height / 2,
      };
    });

const expectVisualCaretAtEndOfFirstBlock = async (root: Locator) => {
  await expect
    .poll(() =>
      root.evaluate((element: HTMLElement) => {
        const selection = element.ownerDocument.getSelection();
        const firstBlock = element.querySelector('[data-plite-node="element"]');

        if (!selection || selection.rangeCount === 0 || !firstBlock) {
          return false;
        }

        const walker = element.ownerDocument.createTreeWalker(
          firstBlock,
          NodeFilter.SHOW_TEXT
        );
        let lastTextNode: Node | null = null;

        while (walker.nextNode()) {
          lastTextNode = walker.currentNode;
        }

        if (!lastTextNode) {
          return false;
        }

        const caretRect = selection.getRangeAt(0).getBoundingClientRect();
        const expectedRange = element.ownerDocument.createRange();
        expectedRange.setStart(
          lastTextNode,
          lastTextNode.textContent?.length ?? 0
        );
        expectedRange.collapse(true);
        const expectedRect = expectedRange.getBoundingClientRect();

        return (
          Math.abs(caretRect.x - expectedRect.x) < 2 &&
          Math.abs(caretRect.y - expectedRect.y) < 2
        );
      })
    )
    .toBe(true);
};

const expectCaretVisibleInsideScrollContainer = async (
  root: Locator,
  target: 'parent' | 'root',
  iteration?: number
) => {
  let lastSnapshot: null | {
    activeElementTagName: string | null;
    anchorInRoot: boolean;
    anchorNodeText: string | null;
    containerRect: { bottom: number; top: number };
    focusInRoot: boolean;
    focusNodeText: string | null;
    hasSelection: boolean;
    iteration: number | null;
    rangeCount: number;
    scrollTarget: 'parent' | 'root';
    scrollTop: number;
    selectionCollapsed: boolean | null;
    textHostText: string | null;
    visible: boolean;
    visibleRect: {
      bottom: number;
      height: number;
      top: number;
      width: number;
    } | null;
  } = null;

  try {
    await expect
      .poll(async () => {
        lastSnapshot = await root.evaluate(
          (
            element: HTMLElement,
            {
              scrollTarget,
              step,
            }: { scrollTarget: 'parent' | 'root'; step: number | null }
          ) => {
            const selection = element.ownerDocument.getSelection();
            const activeElement = element.ownerDocument.activeElement;
            const scrollContainer =
              scrollTarget === 'parent' ? element.parentElement : element;
            const containerRect = scrollContainer?.getBoundingClientRect();
            const base = {
              activeElementTagName:
                activeElement?.tagName?.toLowerCase() ?? null,
              anchorInRoot:
                !!selection?.anchorNode &&
                element.contains(selection.anchorNode),
              anchorNodeText: selection?.anchorNode?.textContent ?? null,
              containerRect: {
                bottom: containerRect?.bottom ?? 0,
                top: containerRect?.top ?? 0,
              },
              focusInRoot:
                !!selection?.focusNode && element.contains(selection.focusNode),
              focusNodeText: selection?.focusNode?.textContent ?? null,
              hasSelection: !!selection,
              iteration: step,
              rangeCount: selection?.rangeCount ?? 0,
              scrollTarget,
              scrollTop: scrollContainer?.scrollTop ?? 0,
              selectionCollapsed: selection?.isCollapsed ?? null,
              textHostText: null,
              visible: false,
              visibleRect: null,
            };

            if (
              !selection ||
              selection.rangeCount === 0 ||
              !scrollContainer ||
              !containerRect
            ) {
              return base;
            }

            const focusElement =
              selection.focusNode instanceof Element
                ? selection.focusNode
                : selection.focusNode instanceof Text
                  ? selection.focusNode.parentElement
                  : null;
            const textHost = focusElement?.closest('[data-plite-node="text"]');
            const range = selection.getRangeAt(0);
            const rangeRect =
              Array.from(range.getClientRects())[0] ??
              range.getBoundingClientRect();
            const rangeRectIsUsable =
              rangeRect.width !== 0 ||
              rangeRect.height !== 0 ||
              rangeRect.x !== 0 ||
              rangeRect.y !== 0;
            const visibleRect = rangeRectIsUsable
              ? rangeRect
              : textHost?.getBoundingClientRect();

            if (
              !visibleRect ||
              (visibleRect.width === 0 && visibleRect.height === 0)
            ) {
              return {
                ...base,
                textHostText: textHost?.textContent ?? null,
              };
            }

            const visible =
              base.anchorInRoot &&
              base.focusInRoot &&
              visibleRect.top >= containerRect.top - 1 &&
              visibleRect.bottom <= containerRect.bottom + 1;

            return {
              ...base,
              textHostText: textHost?.textContent ?? null,
              visible,
              visibleRect: {
                bottom: visibleRect.bottom,
                height: visibleRect.height,
                top: visibleRect.top,
                width: visibleRect.width,
              },
            };
          },
          { scrollTarget: target, step: iteration ?? null }
        );

        return lastSnapshot.visible;
      })
      .toBe(true);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(
      `${message}\nLast caret visibility snapshot: ${JSON.stringify(
        lastSnapshot,
        null,
        2
      )}`
    );
  }
};

const expectDOMCaretAfterInsertedTextBeforeSuffix = async (
  root: Locator,
  insertedText: string,
  trailingText: string
) => {
  await expect
    .poll(() =>
      root.evaluate(
        (
          element: HTMLElement,
          {
            expectedInsertedText,
            expectedTrailingText,
          }: { expectedInsertedText: string; expectedTrailingText: string }
        ) => {
          const selection = element.ownerDocument.getSelection();

          if (
            !selection?.isCollapsed ||
            !selection.anchorNode ||
            !element.contains(selection.anchorNode)
          ) {
            return false;
          }

          const text = selection.anchorNode.textContent ?? '';

          if (
            text === `${expectedInsertedText}${expectedTrailingText}` &&
            selection.anchorOffset === expectedInsertedText.length
          ) {
            return true;
          }

          const walker = element.ownerDocument.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
          );
          let foundAnchor = false;
          let nextText: string | null = null;

          while (walker.nextNode()) {
            const node = walker.currentNode;

            if (foundAnchor) {
              const value = node.textContent ?? '';

              if (value.length > 0) {
                nextText = value;
                break;
              }
            }

            if (node === selection.anchorNode) {
              foundAnchor = true;
            }
          }

          return (
            text === expectedInsertedText &&
            selection.anchorOffset === text.length &&
            !!nextText?.startsWith(expectedTrailingText)
          );
        },
        {
          expectedInsertedText: insertedText,
          expectedTrailingText: trailingText,
        }
      )
    )
    .toBe(true);
};

const expectEditableWordSelected = async (root: Locator) => {
  await expect
    .poll(() =>
      root.evaluate((element: HTMLElement) => {
        const selection = element.ownerDocument.getSelection();

        return {
          containsAnchor:
            !!selection?.anchorNode && element.contains(selection.anchorNode),
          containsFocus:
            !!selection?.focusNode && element.contains(selection.focusNode),
          isCollapsed: selection?.isCollapsed ?? null,
          selectedText: selection?.toString() ?? '',
        };
      })
    )
    .toEqual({
      containsAnchor: true,
      containsFocus: true,
      isCollapsed: false,
      selectedText: 'editable',
    });
};

const expectCollapsedDOMSelectionInsideEditable = async (root: Locator) => {
  await expect
    .poll(() =>
      root.evaluate((element: HTMLElement) => {
        const selection = element.ownerDocument.getSelection();

        return Boolean(
          selection?.isCollapsed &&
            selection.anchorNode &&
            selection.focusNode &&
            element.contains(selection.anchorNode) &&
            element.contains(selection.focusNode)
        );
      })
    )
    .toBe(true);
};

type InputBoundaryProbeEvent = {
  data: string | null;
  inputType: string;
  phase: 'beforeinput' | 'input';
};

const installInputBoundaryProbe = async (root: Locator) => {
  await root.evaluate((element: HTMLElement) => {
    const target = element as HTMLElement & {
      __pliteInputBoundaryProbeEvents?: InputBoundaryProbeEvent[];
    };
    target.__pliteInputBoundaryProbeEvents = [];

    const record =
      (phase: InputBoundaryProbeEvent['phase']) => (event: Event) => {
        const inputEvent = event as InputEvent;

        target.__pliteInputBoundaryProbeEvents!.push({
          data: inputEvent.data ?? null,
          inputType: inputEvent.inputType,
          phase,
        });
      };

    element.addEventListener('beforeinput', record('beforeinput'), true);
    element.addEventListener('input', record('input'), true);
  });
};

const getInputBoundaryProbeEvents = async (root: Locator) =>
  root.evaluate((element: HTMLElement) => {
    const target = element as HTMLElement & {
      __pliteInputBoundaryProbeEvents?: InputBoundaryProbeEvent[];
    };

    return target.__pliteInputBoundaryProbeEvents ?? [];
  });

const getBrowserUndoHotkey = async (root: Locator) =>
  await root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta+Z' : 'Control+Z'
    );

const selectEndOfFirstBlockWithDOMSelection = async (root: Locator) => {
  await root.evaluate((element: HTMLElement) => {
    const firstBlock = element.querySelector('[data-plite-node="element"]');

    if (!firstBlock) {
      throw new Error('Missing first block');
    }

    const walker = document.createTreeWalker(firstBlock, NodeFilter.SHOW_TEXT);
    let lastTextNode: Node | null = null;

    while (walker.nextNode()) {
      lastTextNode = walker.currentNode;
    }

    if (!lastTextNode) {
      throw new Error('Missing first block text');
    }

    const offset = lastTextNode.textContent?.length ?? 0;
    const selection = window.getSelection();

    if (!selection) {
      throw new Error('Missing browser selection');
    }

    selection.removeAllRanges();
    selection.setBaseAndExtent(lastTextNode, offset, lastTextNode, offset);
    document.dispatchEvent(new Event('selectionchange'));

    const handle = (element as Record<string, any>).__pliteBrowserHandle;
    const importedSelection = handle?.importDOMSelection?.();

    if (!importedSelection) {
      throw new Error('Cannot import browser selection into Plite');
    }
  });
};

const dispatchWebKitCompositionEnd = async (root: Locator, data = 'あああ') => {
  await root.evaluate((element: HTMLElement, compositionText) => {
    element.focus();
    element.dispatchEvent(
      new CompositionEvent('compositionend', {
        bubbles: true,
        cancelable: false,
        data: compositionText,
      })
    );
  }, data);
};

test.describe('On richtext example', () => {
  test.beforeEach(
    async ({ page }) => await page.goto('/examples/plite/richtext')
  );

  test('renders rich text', async ({ page }) => {
    await expect(page.locator('strong').nth(0)).toContainText('rich');
    await expect(page.locator('blockquote')).toContainText('wise quote');
  });

  test('clears selected rich text formatting without dropping semantic blocks', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop select-all proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('Foo bar');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('baz qux');
    await editor.assert.blockTexts(['Foo bar', 'baz qux']);

    await editor.selection.selectAll();
    await page.getByTestId('mark-button-bold').click();
    await page.getByTestId('mark-button-italic').click();
    await page.getByTestId('block-button-right').click();

    const paragraphs = editor.root.locator('p');

    await expect(paragraphs.nth(0).locator('strong')).toHaveText('Foo bar');
    await expect(paragraphs.nth(0).locator('em')).toHaveText('Foo bar');
    await expect(paragraphs.nth(1).locator('strong')).toHaveText('baz qux');
    await expect(paragraphs.nth(1).locator('em')).toHaveText('baz qux');

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 'Foo '.length },
      focus: { path: [1, 0], offset: 'baz'.length },
    });
    await page.getByTestId('clear-formatting-button').click();

    await editor.assert.blockTexts(['Foo bar', 'baz qux']);

    await expect(paragraphs.nth(0).locator('strong')).toHaveText('Foo ');
    await expect(paragraphs.nth(0).locator('em')).toHaveText('Foo ');
    await expect(paragraphs.nth(0).locator('strong')).not.toContainText('bar');
    await expect(paragraphs.nth(1).locator('strong')).toHaveText(' qux');
    await expect(paragraphs.nth(1).locator('em')).toHaveText(' qux');
    await expect(paragraphs.nth(1).locator('strong')).not.toContainText('baz');
    await expect(paragraphs.nth(0)).not.toHaveAttribute('style', /text-align/);
    await expect(paragraphs.nth(1)).not.toHaveAttribute('style', /text-align/);

    await page.keyboard.press('ControlOrMeta+A');
    await page.getByTestId('block-button-block-quote').click();
    await page.getByTestId('mark-button-underline').click();
    await page.getByTestId('block-button-right').click();
    await page.getByTestId('clear-formatting-button').click();

    await expect(editor.root.locator('blockquote')).toHaveCount(2);
    await expect(editor.root.locator('blockquote u')).toHaveCount(0);
    await expect(editor.root.locator('blockquote').first()).not.toHaveAttribute(
      'style',
      /text-align/
    );
  });

  test('keeps a backward click caret after typing in the same text node', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop click caret proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('abcdef');
    await editor.assert.blockTexts(['abcdef']);

    await editor.dom.clickTextRange({
      endOffset: 3,
      path: [0, 0],
      startOffset: 2,
    });
    await page.keyboard.type('X');

    await editor.assert.blockTexts(['abXcdef']);
    await editor.assert.collapsedModelDOMSelection({
      offset: 3,
      path: [0, 0],
      text: 'abXcdef',
    });
  });

  test('normalizes select-all Backspace to one empty paragraph', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop select-all proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('Heading');
    await page.getByTestId('block-button-heading-one').click();
    await editor.press('Enter');
    await editor.insertText('Body');

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');

    await expect(editor.root.locator('h1')).toHaveCount(0);
    await expect(editor.root.locator('ol')).toHaveCount(0);
    await expect(editor.root.locator('p')).toHaveCount(1);
    await expect.poll(() => editor.get.modelText()).toBe('');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  test('applies mark hotkeys to inserted rich text and clears active marks', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop hotkey proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await expect
      .poll(() => editor.get.selectedText())
      .toContain('This is editable rich text');
    await page.keyboard.press('Backspace');
    await editor.assert.modelBlockTexts(['']);

    const modifier = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
    );

    await editor.root.press(`${modifier}+b`);
    await page.keyboard.type('Bold');
    await editor.root.press(`${modifier}+b`);
    await page.keyboard.type(' Plain');

    await editor.root.press(`${modifier}+i`);
    await page.keyboard.type(' Italic');
    await editor.root.press(`${modifier}+i`);

    await editor.root.press(`${modifier}+u`);
    await page.keyboard.type(' Under');
    await editor.root.press(`${modifier}+u`);

    await editor.root.press(`${modifier}+Backquote`);
    await page.keyboard.type(' Code');
    await editor.root.press(`${modifier}+Backquote`);
    await page.keyboard.type(' Done');

    await expect(editor.root.locator('strong')).toHaveText('Bold');
    await expect(editor.root.locator('em')).toHaveText(' Italic');
    await expect(editor.root.locator('u')).toHaveText(' Under');
    await expect(editor.root.locator('code')).toHaveText(' Code');
    await expect(editor.root.locator('p')).toContainText(
      'Bold Plain Italic Under Code Done'
    );
  });

  test('preserves selected text marks when typing a replacement', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop selection proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 4 },
    });
    await page.keyboard.type('world');

    await expect
      .poll(async () =>
        editor.root
          .locator('p')
          .first()
          .locator('strong')
          .evaluateAll((nodes) =>
            nodes.map((node) => node.textContent ?? '').join('')
          )
      )
      .toBe('world');
    await expect(editor.root.locator('p').first()).toContainText(
      'This is editable world text'
    );
  });

  test('does not create an orphan block when typing with a collapsed italic hotkey', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop hotkey proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await expect
      .poll(() => editor.get.selectedText())
      .toContain('This is editable rich text');
    await page.keyboard.press('Backspace');
    await editor.assert.modelBlockTexts(['']);

    const modifier = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
    );

    await editor.root.press(`${modifier}+i`);
    await page.keyboard.type('Hello');

    await editor.assert.blockTexts(['Hello']);
    await expect(editor.root.locator('em')).toHaveText('Hello');
  });

  test('keeps active bold on text typed after a soft line break', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop hotkey proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');

    const modifier = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
    );

    await editor.root.press(`${modifier}+b`);
    await page.keyboard.type('Bold');
    await editor.root.press('Shift+Enter');
    await page.keyboard.type('Next');

    await editor.assert.blockTexts(['Bold', 'Next']);
    await expect(editor.root.locator('strong')).toHaveText(['Bold', 'Next']);
  });

  test('keeps an empty soft-break line caret measurable and editable', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop soft-break caret geometry proof'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.click();
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type('alpha');
      await editor.root.press('Shift+Enter');

      await editor.assert.blockTexts(['alpha', '']);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });

      const caretRect = await editor.selection.rect();
      const editorRect = await editor.root.boundingBox();

      if (!caretRect || !editorRect) {
        throw new Error('Missing soft-break caret or editor rect');
      }

      expect(caretRect.height).toBeGreaterThan(0);
      expect(caretRect.y).toBeGreaterThan(editorRect.y);
      expect(caretRect.y).toBeLessThan(editorRect.y + editorRect.height);
      expect(caretRect.x).toBeGreaterThanOrEqual(editorRect.x);
      expect(caretRect.x).toBeLessThanOrEqual(editorRect.x + editorRect.width);
      runtimeErrors.assertNone();

      await page.keyboard.type('beta');

      await editor.assert.blockTexts(['alpha', 'beta']);
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps active bold when Enter creates a new paragraph', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop hotkey proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');

    const modifier = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
    );

    await editor.root.press(`${modifier}+b`);
    await page.keyboard.type('Bold');
    await editor.root.press('Enter');
    await page.keyboard.type('Next');

    await editor.assert.blockTexts(['Bold', 'Next']);
    await expect(editor.root.locator('strong')).toHaveText(['Bold', 'Next']);
  });

  test('keeps active bold after an empty editor loses and regains focus', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop active mark proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await expect
      .poll(() => editor.get.selectedText())
      .toContain('This is editable rich text');
    await page.keyboard.press('Backspace');
    await editor.assert.modelBlockTexts(['']);

    const modifier = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
    );

    await editor.root.press(`${modifier}+b`);
    await page.mouse.click(5, 5);
    await editor.click();
    await page.keyboard.type('Bold');

    await editor.assert.blockTexts(['Bold']);
    await expect(editor.root.locator('strong')).toHaveText('Bold');
  });

  test('keeps selected bold as the active mark after deleting its text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop selected mark proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      await editor.selectAll();
      await editor.deleteFragment();
      await editor.insertText('Styled');
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'Styled'.length },
      });

      await page.getByTestId('mark-button-bold').click();

      await expect(editor.root.locator('strong')).toHaveText('Styled');
      await editor.press('Backspace');
      runtimeErrors.assertNone();
      await editor.type('Next');

      await editor.assert.blockTexts(['Next']);
      await expect(editor.root.locator('strong')).toHaveText('Next');
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps active bold after same-html plain paste', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      await editor.selectAll();
      await editor.deleteFragment();

      const modifier = await editor.root.evaluate(() =>
        /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
      );

      await editor.root.press(`${modifier}+b`);
      await editor.clipboard.pasteHtml('Prediction', 'Prediction');
      await editor.type('!');

      runtimeErrors.assertNone();
      await editor.assert.blockTexts(['Prediction!']);
      await expect(editor.root.locator('strong')).toHaveText('Prediction!');
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps active bold after multiline plain text paste', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      await editor.selectAll();
      await editor.deleteFragment();

      const modifier = await editor.root.evaluate(() =>
        /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
      );

      await editor.root.press(`${modifier}+b`);
      await editor.clipboard.pasteText('First\nSecond');
      await editor.type('!');

      runtimeErrors.assertNone();
      await editor.assert.blockTexts(['First', 'Second!']);
      await expect(editor.root.locator('strong')).toHaveText([
        'First',
        'Second!',
      ]);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps empty paragraph styling after the selection leaves and returns', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop selected mark proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Styled');
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'Styled'.length },
    });
    const modifier = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
    );

    await editor.root.press(`${modifier}+b`);
    await page.keyboard.press('Backspace');
    await editor.root.press('Enter');
    await page.keyboard.type('Other');
    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await page.keyboard.type('Next');

    await editor.assert.blockTexts(['Next', 'Other']);
    await expect(editor.root.locator('p').first().locator('strong')).toHaveText(
      'Next'
    );
  });

  test('keeps active-mark hashtag typing in typed order', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop active mark proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const modifier = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
    );

    await editor.selection.collapse({ path: [0, 0], offset: 'This is'.length });
    await editor.focus();
    await editor.root.press(`${modifier}+b`);
    await page.keyboard.type('#hashtag');

    await editor.assert.blockTexts([
      'This is#hashtag editable rich text, much better than a <textarea>!',
      "Since it's rich text, you can do things like turn a selection of text bold, or add a semantically rendered block quote in the middle of the page, like this:",
      'A wise quote.',
      'Try it out for yourself!',
    ]);
    await expect(
      editor.root.locator('strong').filter({ hasText: '#hashtag' })
    ).toHaveCount(1);
  });

  test('splits before a soft line break without skipping its line', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox' || testInfo.project.name === 'mobile',
      'Desktop native Enter DOM proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await editor.insertText('alpha\nbeta');
    await expect.poll(() => editor.get.modelText()).toBe('alpha\nbeta');
    await expect(editor.root.locator('p')).toHaveCount(1);

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 'alpha'.length },
      focus: { path: [0, 0], offset: 'alpha'.length },
    });
    await editor.focus();
    await page.keyboard.press('Enter');

    await editor.assert.blockTexts(['alpha', 'beta']);
    await expect(editor.root.locator('p')).toHaveCount(2);
    await expect(editor.root.locator('p').nth(0)).toHaveText('alpha');
    await expect(editor.root.locator('p').nth(1)).toHaveText('beta');
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  test('splits text entry between plain and marked text with native Enter', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox' || testInfo.project.name === 'mobile',
      'Desktop native Enter DOM proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('Hello ');
    await page.getByTestId('mark-button-bold').click();
    await page.keyboard.type('world');

    await editor.selection.selectDOM({
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    });
    await page.keyboard.press('Enter');

    await editor.assert.blockTexts(['Hello ', 'world']);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    await expect(editor.root.locator('p')).toHaveCount(2);
    await expect(editor.root.locator('p').nth(1).locator('strong')).toHaveText(
      'world'
    );
  });

  test('applies block, alignment, and clear-formatting hotkeys', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const modifier = await editor.root.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
    );
    const pressShortcut = async (
      key: string,
      extraModifiers: readonly string[] = []
    ) => {
      await page.keyboard.down(modifier);
      for (const extraModifier of extraModifiers) {
        await page.keyboard.down(extraModifier);
      }
      await page.keyboard.press(key);
      for (const extraModifier of [...extraModifiers].reverse()) {
        await page.keyboard.up(extraModifier);
      }
      await page.keyboard.up(modifier);
    };

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('Shortcut text');
    await editor.focus();

    await pressShortcut('1', ['Alt']);
    await expect(editor.root.locator('h1')).toHaveText('Shortcut text');

    await pressShortcut('0', ['Alt']);
    await expect(editor.root.locator('p')).toHaveText('Shortcut text');

    await pressShortcut('2', ['Alt']);
    await expect(editor.root.locator('h2')).toHaveText('Shortcut text');

    await editor.focus();
    await pressShortcut('j', ['Shift']);
    await expect(editor.root.locator('h2')).toHaveCSS('text-align', 'justify');

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'Shortcut'.length },
    });
    await editor.focus();
    await pressShortcut('b');
    await expect(editor.root.locator('strong')).toHaveText('Shortcut');

    await editor.focus();
    await pressShortcut('Backslash');

    await expect(editor.root.locator('h2')).toHaveText('Shortcut text');
    await expect(editor.root.locator('strong')).toHaveCount(0);
    await expect(editor.root.locator('h2')).not.toHaveAttribute(
      'style',
      /text-align/
    );
  });

  test('center-aligns an empty paragraph from the toolbar', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 6], offset: 1 });
    await editor.focus();
    await page.keyboard.press('Enter');
    await expect(editor.locator.block([1])).toHaveText('');
    await editor.selection.collapse({ path: [1, 0], offset: 0 });
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

    await page.getByTestId('block-button-center').click();

    await expect(page.locator('[data-plite-editor] p').nth(1)).toHaveCSS(
      'text-align',
      'center'
    );
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
  });

  test('inserts text through browser input', async ({ page }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    if (testInfo.project.name === 'mobile') {
      await editor.insertText('Hello World');
    } else {
      await page.keyboard.insertText('Hello World');
    }

    await editor.assert.text('Hello World');
    await expect.poll(() => editor.get.modelText()).toContain('Hello World');
  });

  test('ignores synthetic beforeinput when the browser has no selection ranges', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop beforeinput proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const before = await editor.get.blockTexts();

    await editor.click();
    const dispatched = await editor.root.evaluate((element: HTMLElement) => {
      const selection = element.ownerDocument.getSelection();
      selection?.removeAllRanges();
      const rangeCountBefore = selection?.rangeCount ?? 0;
      const event = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: 'Z',
        inputType: 'insertText',
      });
      element.dispatchEvent(event);

      return {
        defaultPrevented: event.defaultPrevented,
        rangeCountBefore,
      };
    });

    expect(dispatched).toEqual({
      defaultPrevented: false,
      rangeCountBefore: 0,
    });
    await expect.poll(() => editor.get.blockTexts()).toEqual(before);
  });

  test('syncs browser text mutations inside bold markup', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox' || testInfo.project.name === 'mobile',
      'Non-Firefox desktop DOM-change proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText =
      'This is editable rich text, much better than a <textarea>!';
    const insertedText =
      'This is editable riZch text, much better than a <textarea>!';
    const pointInsideBold = { path: [0, 1], offset: 2 };

    await editor.selection.selectDOM({
      anchor: pointInsideBold,
      focus: pointInsideBold,
    });

    await page.keyboard.insertText('Z');

    await editor.assert.text(insertedText);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'riZch' })
    ).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 1], offset: 3 },
    });

    await page.keyboard.press('Backspace');

    await editor.assert.text(initialText);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'rich' })
    ).toHaveCount(1);
    await editor.assert.selection({
      anchor: pointInsideBold,
      focus: pointInsideBold,
    });
  });

  test('syncs browser text mutations inside nested mark DOM', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox' || testInfo.project.name === 'mobile',
      'Non-Firefox desktop DOM-change proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText =
      'This is editable rich text, much better than a <textarea>!';
    const insertedText =
      'This is editable riZch text, much better than a <textarea>!';
    const boldTextRange = {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 'rich'.length },
    };
    const pointInsideNestedMarks = { path: [0, 1], offset: 2 };
    const nestedMarkText = editor.root.locator('em strong, strong em');

    await editor.selection.select(boldTextRange);
    await page.getByTestId('mark-button-italic').click();
    await expect(nestedMarkText).toHaveText('rich');

    await editor.selection.selectDOM({
      anchor: pointInsideNestedMarks,
      focus: pointInsideNestedMarks,
    });
    await page.keyboard.insertText('Z');

    await editor.assert.text(insertedText);
    await expect(nestedMarkText).toHaveText('riZch');
    await editor.assert.selection({
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 1], offset: 3 },
    });

    await page.keyboard.press('Backspace');

    await editor.assert.text(initialText);
    await expect(nestedMarkText).toHaveText('rich');
    await editor.assert.selection({
      anchor: pointInsideNestedMarks,
      focus: pointInsideNestedMarks,
    });
  });

  test('keeps burst typing before a mixed bold italic boundary at the caret', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox' || testInfo.project.name === 'mobile',
      'Non-Firefox desktop mark-boundary proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const modifier = await editor.root
      .page()
      .evaluate(() =>
        /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
      );
    const burst = 'zzzzzzzz';

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('choice');
    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'choice'.length },
    });
    await editor.root.press(`${modifier}+b`);
    await editor.root.press(`${modifier}+i`);
    await editor.selection.collapse({ path: [0, 0], offset: 3 });
    await editor.root.press(`${modifier}+b`);
    await page.keyboard.type(burst);
    await page.keyboard.type('Y');

    await editor.assert.blockTexts([`cho${burst}Yice`]);
    await editor.assert.selection({
      anchor: { path: [0, 1], offset: burst.length + 1 },
      focus: { path: [0, 1], offset: burst.length + 1 },
    });
  });

  test('mouse drag undo restores typed multi-leaf selected text replacement', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop selection proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const originalText =
      'This is editable rich text, much better than a <textarea>!';
    const selectedText = 'editable rich text';
    const selection = {
      anchor: { path: [0, 0], offset: 'This is '.length },
      focus: { path: [0, 2], offset: ' text'.length },
    };

    await editor.selection.dragTextRange({
      endOffset: ' text'.length,
      endText: ' text, ',
      settleMs: 25,
      startOffset: 'This is '.length,
      text: 'This is editable ',
    });

    await assertPliteBrowserSelectionContract(editor, {
      domSelection: {
        anchorNodeText: 'This is editable ',
        anchorOffset: 'This is '.length,
        focusNodeText: ' text, ',
        focusOffset: ' text'.length,
      },
      noDoubleSelectionHighlight: true,
      selectedText,
      selection,
    });

    await page.keyboard.type('example');
    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe('This is example, much better than a <textarea>!');

    await page.keyboard.press(await getBrowserUndoHotkey(editor.root));

    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe(originalText);
    await assertPliteBrowserSelectionContract(editor, {
      domSelection: {
        anchorNodeText: 'This is editable ',
        anchorOffset: 'This is '.length,
        focusNodeText: ' text, ',
        focusOffset: ' text'.length,
      },
      noDoubleSelectionHighlight: true,
      selectedText,
      selection,
    });
  });

  test('exposes input intent for start insert, number insert, and delete', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop input boundary proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText =
      'This is editable rich text, much better than a <textarea>!';
    const startPoint = { path: [0, 0], offset: 0 };

    await installInputBoundaryProbe(editor.root);
    await editor.selection.selectDOM({
      anchor: startPoint,
      focus: startPoint,
    });

    await page.keyboard.insertText('A');
    await page.keyboard.insertText('7');

    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe(`A7${initialText}`);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });

    await page.keyboard.press('Backspace');

    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe(`A${initialText}`);

    const events = await getInputBoundaryProbeEvents(editor.root);
    const beforeInputEvents = events.filter(
      (event) => event.phase === 'beforeinput'
    );

    expect(beforeInputEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          data: 'A',
          inputType: expect.stringMatching(/^insert(?:Composition)?Text$/),
        }),
        expect.objectContaining({
          data: '7',
          inputType: expect.stringMatching(/^insert(?:Composition)?Text$/),
        }),
      ])
    );
    await editor.assert.kernelTrace({
      commandKind: 'delete',
      eventFamily: 'keydown',
      ownership: 'model-owned',
      transition: { allowed: true },
    });
  });

  test('commits IME composition inside bold markup', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText =
      'This is editable rich text, much better than a <textarea>!';
    const insertedText =
      'This is editable riすしch text, much better than a <textarea>!';
    const pointInsideBold = { path: [0, 1], offset: 2 };

    await editor.selection.selectDOM({
      anchor: pointInsideBold,
      focus: pointInsideBold,
    });
    await editor.assert.domSelection({
      anchorNodeText: 'rich',
      anchorOffset: 2,
      focusNodeText: 'rich',
      focusOffset: 2,
    });

    await editor.locator.text(pointInsideBold.path).evaluate(
      (
        element: HTMLElement,
        {
          committedText,
          offset,
          steps,
        }: { committedText: string; offset: number; steps: string[] }
      ) => {
        const root = element.closest(
          '[data-plite-editor="true"]'
        ) as HTMLElement | null;
        const selection = element.ownerDocument.getSelection();
        const walker = element.ownerDocument.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT
        );
        const textNode = walker.nextNode();

        if (!root || !selection || !textNode) {
          throw new Error('Cannot compose inside bold text');
        }

        const range = element.ownerDocument.createRange();
        range.setStart(textNode, offset);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        const dispatchCompositionEvent = (
          type: 'compositionstart' | 'compositionupdate' | 'compositionend',
          data: string
        ) => {
          root.dispatchEvent(
            new CompositionEvent(type, {
              bubbles: true,
              cancelable: true,
              data,
            })
          );
        };

        const insertionRange = range.cloneRange();

        dispatchCompositionEvent('compositionstart', steps[0] ?? '');
        steps.forEach((text) => {
          dispatchCompositionEvent('compositionupdate', text);
        });

        insertionRange.deleteContents();
        const composedNode =
          element.ownerDocument.createTextNode(committedText);
        insertionRange.insertNode(composedNode);
        insertionRange.setStart(composedNode, committedText.length);
        insertionRange.setEnd(composedNode, committedText.length);
        selection.removeAllRanges();
        selection.addRange(insertionRange);

        dispatchCompositionEvent('compositionend', committedText);
        element.ownerDocument.dispatchEvent(
          new Event('selectionchange', { bubbles: true })
        );
      },
      {
        committedText: 'すし',
        offset: pointInsideBold.offset,
        steps: ['す', 'すし'],
      }
    );

    await editor.assert.text(insertedText);
    await expect.poll(() => editor.get.modelText()).toContain(insertedText);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'すし' })
    ).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [0, 2], offset: 2 },
      focus: { path: [0, 2], offset: 2 },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      ownership: 'native-allowed',
      transition: { allowed: true },
    });

    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    await editor.assert.text(initialText);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'ri' })
    ).toHaveCount(1);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'ch' })
    ).toHaveCount(1);
    await editor.assert.selection({
      anchor: pointInsideBold,
      focus: pointInsideBold,
    });
  });

  test('commits IME composition in an empty rich text block', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium CDP IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const insertedText = 'すし';

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await expect.poll(() => editor.get.modelText()).toBe('');
    await editor.assert.blockTexts(['Enter some rich text…']);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    for (const text of ['ｓ', 'す', 'すｓ', 'すｓｈ', insertedText]) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    await client.send('Input.insertText', { text: insertedText });

    await editor.assert.text(insertedText);
    await expect.poll(() => editor.get.modelText()).toBe(insertedText);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: insertedText.length },
      focus: { path: [0, 0], offset: insertedText.length },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('replaces select-all rich text with IME composition', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium CDP IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const insertedText = 'すし';

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    for (const text of ['ｓ', 'す', 'すｓ', 'すｓｈ', insertedText]) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    await client.send('Input.insertText', { text: insertedText });

    await editor.assert.text(insertedText);
    await expect.poll(() => editor.get.modelText()).toBe(insertedText);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: insertedText.length },
      focus: { path: [0, 0], offset: insertedText.length },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('commits IME composition through an active mark in an empty block', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium IME cursor-wrapper proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await expect.poll(() => editor.get.modelText()).toBe('');
    await editor.assert.blockTexts(['Enter some rich text…']);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await page.getByTestId('mark-button-bold').click();
    await editor.assert.focusOwner('editor');
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    for (const text of ['a', 'ab', 'abc']) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    await client.send('Input.insertText', { text: 'abc' });

    await editor.assert.text('abc');
    await expect(
      editor.root.locator('strong').filter({ hasText: 'abc' })
    ).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'abc'.length },
      focus: { path: [0, 0], offset: 'abc'.length },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('commits IME composition through an active mark before a formatted sibling', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium IME cursor-wrapper proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('two three');
    await editor.assert.text('two three');

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'two three'.length },
    });
    await page.getByTestId('mark-button-italic').click();
    await expect(editor.root.locator('em')).toHaveText('two three');

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 'two'.length },
      focus: { path: [0, 0], offset: 'two three'.length },
    });
    await page.getByTestId('mark-button-bold').click();
    await expect(
      editor.root.locator('em strong').filter({ hasText: ' three' })
    ).toHaveCount(1);

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 'two'.length },
      focus: { path: [0, 0], offset: 'two'.length },
    });
    await page.getByTestId('mark-button-code').click();
    await editor.assert.focusOwner('editor');
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    for (const text of ['o', 'oo', 'oow']) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    await client.send('Input.insertText', { text: 'oow' });

    await editor.assert.text('twooow three');
    await expect(
      editor.root.locator('em code').filter({ hasText: 'oow' })
    ).toHaveCount(1);
    await expect(
      editor.root.locator('em strong').filter({ hasText: 'three' })
    ).toHaveCount(1);
    await editor.assert.selection({
      anchor: { path: [0, 1], offset: 'oow'.length },
      focus: { path: [0, 1], offset: 'oow'.length },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('replaces multiple formatted text nodes with Korean IME composition', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const insertedText = '가나다';
    const expectedText = 'This is editable 가나다 better than a <textarea>!';

    await editor.ime.enableKeyEvents();
    await editor.root.evaluate((element: HTMLElement) => {
      const handle = (element as Record<string, any>).__pliteBrowserHandle;
      const selection = element.ownerDocument.getSelection();

      if (!handle?.selectRange || !selection) {
        throw new Error('Cannot compose across formatted text');
      }

      const textNodeAt = (path: number[]) => {
        const host = element.querySelector(
          `[data-plite-node="text"][data-plite-path="${path.join(',')}"]`
        );
        const walker =
          host &&
          element.ownerDocument.createTreeWalker(host, NodeFilter.SHOW_TEXT);
        const node = walker?.nextNode();

        if (!node) {
          throw new Error(`Cannot find text node at ${path.join(',')}`);
        }

        return node;
      };

      const anchor = { path: [0, 1], offset: 0 };
      const focus = { path: [0, 3], offset: 'much'.length };

      handle.selectRange({ anchor, focus });

      const range = element.ownerDocument.createRange();
      range.setStart(textNodeAt(anchor.path), anchor.offset);
      range.setEnd(textNodeAt(focus.path), focus.offset);
      selection.removeAllRanges();
      selection.addRange(range);
      element.ownerDocument.dispatchEvent(
        new Event('selectionchange', { bubbles: true })
      );
    });

    const client = await page.context().newCDPSession(page);

    for (const text of ['ㄱ', '가', '가ㄴ', '가나', '가나ㄷ', insertedText]) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    await client.send('Input.insertText', { text: insertedText });

    await editor.assert.text(expectedText);
    await expect.poll(() => editor.get.modelText()).toContain(expectedText);
    await expect(
      editor.root.locator('strong').filter({ hasText: insertedText })
    ).toHaveCount(1);
    await expect(
      editor.root.locator('em').filter({ hasText: 'much' })
    ).toHaveCount(0);
    await editor.assert.selection({
      anchor: { path: [0, 1], offset: insertedText.length },
      focus: { path: [0, 1], offset: insertedText.length },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      ownership: 'native-allowed',
      transition: { allowed: true },
    });
  });

  test('commits rapid consecutive IME compositions in separate rich text blocks', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('one');
    await editor.press('Enter');
    await editor.insertText('two');
    await editor.assert.blockTexts(['one', 'two']);

    await editor.selection.collapse({ path: [0, 0], offset: 'one'.length });
    await editor.focus();
    await editor.ime.compose({
      committedText: '!',
      steps: ['！', '!'],
      text: '!',
      transport: 'synthetic',
    });
    await editor.selection.collapse({ path: [1, 0], offset: 'two'.length });
    await editor.focus();
    await editor.ime.compose({
      committedText: '.',
      steps: ['。', '.'],
      text: '.',
      transport: 'synthetic',
    });

    await editor.assert.blockTexts(['one!', 'two.']);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 'two.'.length },
      focus: { path: [1, 0], offset: 'two.'.length },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('preserves native IME composition when model text changes before it', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText = 'one two three';
    const prefix = '>';
    const composedText = '段';
    const compositionOffset = 'one '.length;
    const expectedText = `${prefix}one ${composedText}two three`;
    const expectedOffset = `${prefix}one ${composedText}`.length;

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText(initialText);
    await editor.selection.collapse({
      path: [0, 0],
      offset: compositionOffset,
    });
    await editor.focus();
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    await client.send('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 1,
      text: 'だ',
    });

    await editor.root.evaluate(
      (element: HTMLElement, { insertedPrefix }) => {
        const handle = (element as Record<string, any>).__pliteBrowserHandle;

        if (!handle?.applyOperations) {
          throw new Error('Cannot apply operation during IME composition');
        }

        handle.applyOperations([
          {
            offset: 0,
            path: [0, 0],
            text: insertedPrefix,
            type: 'insert_text',
          },
        ]);
      },
      { insertedPrefix: prefix }
    );

    await client.send('Input.imeSetComposition', {
      selectionEnd: composedText.length,
      selectionStart: composedText.length,
      text: composedText,
    });
    await client.send('Input.insertText', { text: composedText });

    await editor.assert.blockTexts([expectedText]);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: expectedOffset },
      focus: { path: [0, 0], offset: expectedOffset },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('keeps native IME composition coherent when model delete starts at composition point', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText = 'one two three';
    const deletedText = 'two';
    const composedText = '段';
    const compositionOffset = 'one '.length;
    const expectedText = `one ${composedText} three`;
    const expectedOffset = `one ${composedText}`.length;

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText(initialText);
    await editor.selection.collapse({
      path: [0, 0],
      offset: compositionOffset,
    });
    await editor.focus();
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    await client.send('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 1,
      text: 'だ',
    });

    await editor.root.evaluate(
      (element: HTMLElement, { deleted, offset }) => {
        const handle = (element as Record<string, any>).__pliteBrowserHandle;

        if (!handle?.applyOperations) {
          throw new Error('Cannot apply operation during IME composition');
        }

        handle.applyOperations([
          {
            offset,
            path: [0, 0],
            text: deleted,
            type: 'remove_text',
          },
        ]);
      },
      { deleted: deletedText, offset: compositionOffset }
    );

    await client.send('Input.imeSetComposition', {
      selectionEnd: composedText.length,
      selectionStart: composedText.length,
      text: composedText,
    });
    await client.send('Input.insertText', { text: composedText });

    await editor.assert.blockTexts([expectedText]);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: expectedOffset },
      focus: { path: [0, 0], offset: expectedOffset },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('keeps native IME composition coherent when plain text is pasted at the composition point', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText = 'one two three';
    const pastedText = 'PASTE';
    const composedText = '段';
    const compositionOffset = 'one '.length;
    const expectedText = `one ${pastedText}${composedText}two three`;
    const expectedOffset = `one ${pastedText}${composedText}`.length;

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText(initialText);
    await editor.selection.collapse({
      path: [0, 0],
      offset: compositionOffset,
    });
    await editor.focus();
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    await client.send('Input.imeSetComposition', {
      selectionEnd: 1,
      selectionStart: 1,
      text: 'だ',
    });

    const beforeTraceLength = (await editor.get.kernelTrace()).length;

    await editor.clipboard.pasteNativeText(pastedText);
    await expect
      .poll(() =>
        editor.get
          .kernelTrace()
          .then((trace) =>
            trace
              .slice(beforeTraceLength)
              .some(
                (entry) =>
                  entry.eventFamily === 'paste' &&
                  entry.command?.kind === 'insert-data'
              )
          )
      )
      .toBe(true);

    await client.send('Input.imeSetComposition', {
      selectionEnd: composedText.length,
      selectionStart: composedText.length,
      text: composedText,
    });
    await client.send('Input.insertText', { text: composedText });

    await editor.assert.blockTexts([expectedText]);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: expectedOffset },
      focus: { path: [0, 0], offset: expectedOffset },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('replaces a cross-paragraph rich text selection with IME composition', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium IME proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const insertedText = '段';

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('one two');
    await editor.press('Enter');
    await editor.insertText('three');
    await editor.press('Enter');
    await editor.insertText('four five');
    await editor.assert.blockTexts(['one two', 'three', 'four five']);

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 'one '.length },
      focus: { path: [2, 0], offset: 'four'.length },
    });
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'one '.length },
      focus: { path: [2, 0], offset: 'four'.length },
    });
    await expect
      .poll(async () =>
        (await editor.get.selectedText()).replace(/\n{2,}/g, '\n')
      )
      .toBe('two\nthree\nfour');
    await editor.ime.enableKeyEvents();

    const client = await page.context().newCDPSession(page);

    for (const text of ['だ', insertedText]) {
      await client.send('Input.imeSetComposition', {
        selectionEnd: text.length,
        selectionStart: text.length,
        text,
      });
    }
    await client.send('Input.insertText', { text: insertedText });

    await editor.assert.blockTexts([`one ${insertedText} five`]);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: `one ${insertedText}`.length },
      focus: { path: [0, 0], offset: `one ${insertedText}`.length },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('replaces a cross-paragraph rich text selection with synthetic IME composition', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Chromium helper proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const insertedText = '段';

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('one two');
    await editor.press('Enter');
    await editor.insertText('three');
    await editor.press('Enter');
    await editor.insertText('four five');
    await editor.assert.blockTexts(['one two', 'three', 'four five']);

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 'one '.length },
      focus: { path: [2, 0], offset: 'four'.length },
    });
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'one '.length },
      focus: { path: [2, 0], offset: 'four'.length },
    });
    await editor.ime.compose({
      committedText: insertedText,
      steps: ['だ', insertedText],
      text: insertedText,
      transport: 'synthetic',
    });

    await editor.assert.blockTexts([`one ${insertedText} five`]);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: `one ${insertedText}`.length },
      focus: { path: [0, 0], offset: `one ${insertedText}`.length },
    });
    await editor.assert.kernelTrace({
      eventFamily: 'compositionend',
      transition: { allowed: true },
    });
  });

  test('deletes rich text selection after WebKit compositionend', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'webkit',
      'WebKit compositionend proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await dispatchWebKitCompositionEnd(editor.root);
    const selectedText = (await editor.get.blockTexts()).join('\n');

    await page.keyboard.press('ControlOrMeta+A');

    await expect
      .poll(() =>
        editor.root.evaluate((element: HTMLElement) => {
          const selection = element.ownerDocument.getSelection();

          return {
            containsAnchor:
              !!selection?.anchorNode && element.contains(selection.anchorNode),
            containsFocus:
              !!selection?.focusNode && element.contains(selection.focusNode),
            isCollapsed: selection?.isCollapsed ?? null,
            selectedText: selection?.toString() ?? '',
          };
        })
      )
      .toEqual({
        containsAnchor: true,
        containsFocus: true,
        isCollapsed: false,
        selectedText,
      });

    await page.keyboard.press('Backspace');

    await expect.poll(() => editor.get.modelText()).toBe('');
    await editor.assert.blockTexts(['Enter some rich text…']);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await editor.assert.kernelTrace({
      commandKind: 'delete-fragment',
      eventFamily: 'keydown',
      ownership: 'model-owned',
      transition: { allowed: true },
    });
  });

  test('deletes rich text line selection after WebKit compositionend', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'webkit',
      'WebKit compositionend proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('World');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('あああ');
    await editor.assert.blockTexts(['Hello', 'World', 'あああ']);

    await dispatchWebKitCompositionEnd(editor.root);
    await page.keyboard.press('Shift+ArrowUp');
    await page.keyboard.press('Shift+ArrowUp');

    await expect
      .poll(() =>
        editor.root.evaluate((element: HTMLElement) => {
          const selection = element.ownerDocument.getSelection();

          return {
            containsAnchor:
              !!selection?.anchorNode && element.contains(selection.anchorNode),
            containsFocus:
              !!selection?.focusNode && element.contains(selection.focusNode),
            isCollapsed: selection?.isCollapsed ?? null,
            selectedText: selection?.toString() ?? '',
          };
        })
      )
      .toEqual({
        containsAnchor: true,
        containsFocus: true,
        isCollapsed: false,
        selectedText: '\nWorld\nあああ',
      });

    await page.keyboard.press('Backspace');

    await editor.assert.blockTexts(['Hello']);
    await expect.poll(() => editor.get.modelText()).toBe('Hello');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'Hello'.length },
      focus: { path: [0, 0], offset: 'Hello'.length },
    });
    await editor.assert.kernelTrace({
      commandKind: 'delete-fragment',
      eventFamily: 'keydown',
      ownership: 'model-owned',
      transition: { allowed: true },
    });
  });

  test('keeps model selection when focus moves outside the editor', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const selection = {
      anchor: { path: [0, 6], offset: 1 },
      focus: { path: [0, 6], offset: 1 },
    };

    await page.evaluate(() => {
      document.getElementById('outside-focus-target')?.remove();

      const input = document.createElement('input');
      input.id = 'outside-focus-target';
      input.type = 'text';
      input.value = 'outside';
      document.body.append(input);
    });

    await editor.selection.select(selection);
    await page.locator('#outside-focus-target').focus();

    await expect(page.locator('#outside-focus-target')).toBeFocused();
    await expect.poll(() => editor.selection.get()).toEqual(selection);
  });

  test('hides the visible caret after tabbing out of the editor', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Tab-away proof');
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit does not move Tab focus to the injected input in Playwright'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.root.evaluate((element: HTMLElement) => {
      document.getElementById('tab-away-target')?.remove();

      const input = document.createElement('input');
      input.id = 'tab-away-target';
      input.type = 'text';
      input.value = 'outside';
      element.insertAdjacentElement('afterend', input);
    });

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });
    await editor.focus();
    await editor.assert.focusOwner('editor');
    await editor.assert.caretVisibleInScrollableParent();

    await page.keyboard.press('Tab');

    await expect(page.locator('#tab-away-target')).toBeFocused();
    await editor.assert.focusOwner('outside');
    await editor.assert.noVisibleCaretInRoot();
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      });

    await editor.focus();
    await page.keyboard.insertText('!');

    await expect.poll(() => editor.get.modelText()).toContain('This! is');
  });

  for (const scrollTarget of ['root', 'parent'] as const) {
    test(`keeps caret visible while typing in a scrollable editor ${scrollTarget}`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name === 'mobile', 'Desktop scroll proof');

      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.root.evaluate((element: HTMLElement, target) => {
        const scrollContainer =
          target === 'parent' ? element.parentElement : element;

        if (!scrollContainer) {
          throw new Error('Missing scroll container');
        }

        scrollContainer.style.display = 'block';
        scrollContainer.style.maxHeight = '120px';
        scrollContainer.style.overflowY = 'auto';
      }, scrollTarget);
      await editor.selection.select({
        anchor: { path: [0, 6], offset: 1 },
        focus: { path: [0, 6], offset: 1 },
      });

      for (let i = 0; i < 12; i++) {
        await page.keyboard.insertText(`Line ${i}`);
        await page.keyboard.press('Enter');
        await expectCaretVisibleInsideScrollContainer(
          editor.root,
          scrollTarget,
          i
        );
      }
    });
  }

  test('does not reverse scroll after PageDown in a scrollable editor', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop scroll proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.root.evaluate((element: HTMLElement) => {
      element.style.display = 'block';
      element.style.maxHeight = '120px';
      element.style.overflowY = 'auto';
      element.style.scrollBehavior = 'auto';
    });
    await editor.selection.select({
      anchor: { path: [0, 6], offset: 1 },
      focus: { path: [0, 6], offset: 1 },
    });

    for (let i = 0; i < 18; i++) {
      await page.keyboard.type(`Line ${i}`);
      await page.keyboard.press('Enter');
    }

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.focus();
    await editor.root.evaluate((element: HTMLElement) => {
      element.scrollTop = 0;

      const target = element as HTMLElement & {
        __plitePageKeyScrollSamples?: number[];
        __plitePageKeyScrollUntil?: number;
      };

      target.__plitePageKeyScrollSamples = [];
      target.__plitePageKeyScrollUntil = performance.now() + 500;

      const sample = () => {
        target.__plitePageKeyScrollSamples!.push(element.scrollTop);

        if (performance.now() < target.__plitePageKeyScrollUntil!) {
          requestAnimationFrame(sample);
        }
      };

      requestAnimationFrame(sample);
    });
    await editor.root.press('PageDown');
    await page.waitForTimeout(550);

    const samples = await editor.root.evaluate((element: HTMLElement) => {
      const target = element as HTMLElement & {
        __plitePageKeyScrollSamples?: number[];
      };

      return target.__plitePageKeyScrollSamples ?? [];
    });
    const finalScrollTop = samples.at(-1) ?? 0;

    expect(finalScrollTop).toBeGreaterThan(0);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1] - 2);
    }
  });

  test('does not scroll to top when refocusing a scrollable editor', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop focus scroll proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await page.evaluate(() => {
      document.getElementById('outside-focus-target')?.remove();

      const input = document.createElement('input');
      input.id = 'outside-focus-target';
      input.type = 'text';
      input.value = 'outside';
      document.body.append(input);
    });
    await editor.root.evaluate((element: HTMLElement) => {
      element.style.display = 'block';
      element.style.maxHeight = '120px';
      element.style.overflowY = 'auto';
      element.style.scrollBehavior = 'auto';
    });
    await editor.selection.select({
      anchor: { path: [0, 6], offset: 1 },
      focus: { path: [0, 6], offset: 1 },
    });

    for (let i = 0; i < 18; i++) {
      await page.keyboard.type(`Line ${i}`);
      await page.keyboard.press('Enter');
    }

    const blockTexts = await editor.get.modelBlockTexts();
    const lastBlockIndex = blockTexts.length - 1;
    const lastBlockText = blockTexts[lastBlockIndex] ?? '';
    const bottomSelection = {
      anchor: { path: [lastBlockIndex, 0], offset: lastBlockText.length },
      focus: { path: [lastBlockIndex, 0], offset: lastBlockText.length },
    };

    await editor.selection.select(bottomSelection);
    await editor.root.evaluate((element: HTMLElement) => {
      element.scrollTop = element.scrollHeight - element.clientHeight;
    });
    const beforeFocusScrollTop = await editor.root.evaluate(
      (element: HTMLElement) => Math.round(element.scrollTop)
    );

    await page.locator('#outside-focus-target').click();
    await expect
      .poll(() => page.evaluate(() => document.activeElement?.id ?? null))
      .toBe('outside-focus-target');
    await editor.focus();
    await editor.assert.caretVisibleInScrollableParent();

    const afterFocusScrollTop = await editor.root.evaluate(
      (element: HTMLElement) => Math.round(element.scrollTop)
    );

    expect(beforeFocusScrollTop).toBeGreaterThan(0);
    expect(afterFocusScrollTop).toBeGreaterThanOrEqual(
      Math.round(beforeFocusScrollTop * 0.75)
    );
  });

  test('resolves ambiguous browser insertion at a mark boundary', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox' || testInfo.project.name === 'mobile',
      'Non-Firefox desktop DOM-change proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText =
      'This is editable rich text, much better than a <textarea>!';
    const insertedText =
      'This is editable rich  text, much better than a <textarea>!';
    const boundaryPoint = { path: [0, 1], offset: 'rich'.length };

    await editor.selection.select({
      anchor: boundaryPoint,
      focus: boundaryPoint,
    });

    await page.keyboard.insertText(' ');

    await editor.assert.text(insertedText);
    await expect(editor.root.locator('strong').first()).toHaveText('rich ');
    await editor.assert.selection({
      anchor: { path: [0, 1], offset: 'rich '.length },
      focus: { path: [0, 1], offset: 'rich '.length },
    });

    await page.keyboard.press('Backspace');

    await editor.assert.text(initialText);
    await expect(editor.root.locator('strong').first()).toHaveText('rich');
    await editor.assert.selection({
      anchor: boundaryPoint,
      focus: boundaryPoint,
    });
  });

  test('runs a traced plite-browser scenario', async ({ page }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const mobile = testInfo.project.name === 'mobile';
    const selection = mobile
      ? {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        }
      : {
          anchor: { path: [0, 6], offset: 1 },
          focus: { path: [0, 6], offset: 1 },
        };
    const expectedText = mobile
      ? 'SThis is editable rich text'
      : 'This is editable rich text, much better than a <textarea>!S';
    const expectedSelection = mobile
      ? {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        }
      : {
          anchor: { path: [0, 6], offset: 2 },
          focus: { path: [0, 6], offset: 2 },
        };

    const result = await editor.scenario.run('richtext-traced-type', [
      {
        kind: 'select',
        label: 'select-end',
        selection,
      },
      mobile
        ? { kind: 'insertText', label: 'insert-suffix', text: 'S' }
        : { kind: 'type', label: 'type-suffix', text: 'S' },
      {
        kind: 'assertText',
        label: 'assert-text',
        text: expectedText,
      },
      {
        kind: 'assertSelection',
        label: 'assert-selection',
        selection: expectedSelection,
      },
      ...(mobile
        ? []
        : [
            {
              kind: 'assertDOMSelection' as const,
              label: 'assert-dom-selection',
              selection: {
                anchorNodeText: '!S',
                anchorOffset: 2,
                focusNodeText: '!S',
                focusOffset: 2,
              },
            },
          ]),
    ]);

    expect(result.name).toBe('richtext-traced-type');
    expect(result.trace).toHaveLength(mobile ? 4 : 5);
    expect(result.trace.at(-1)?.snapshot.text).toContain(expectedText);
  });

  test('runs generated navigation and typing gauntlet without illegal kernel transitions', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const mobile = testInfo.project.name === 'mobile';
    const result = await editor.scenario.run(
      'richtext-generated-navigation-typing-gauntlet',
      createPliteBrowserNavigationTypingGauntlet({
        insertedText: 'G',
        movedSelection: {
          anchor: { path: [0, 6], offset: 1 },
          focus: { path: [0, 6], offset: 1 },
        },
        startSelection: {
          anchor: { path: [0, 6], offset: 0 },
          focus: { path: [0, 6], offset: 0 },
        },
        textAfterInsert: '!G',
      }),
      {
        metadata: {
          capabilities: [
            'generated-gauntlet',
            'keyboard-navigation',
            'model-selection',
            'text-mutation',
          ],
          platform: testInfo.project.name,
          transport: mobile
            ? 'semantic-handle-and-playwright-keyboard'
            : 'keyboard-and-handle',
        },
        tracePath: testInfo.outputPath(
          'richtext-generated-navigation-typing-gauntlet.json'
        ),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.metadata.claim).toBe(
      mobile ? 'mobile-semantic-handle' : 'mixed-native-and-semantic'
    );
    expect(result.replay.replayable).toBe(true);
    expect(result.replay.steps.map((step) => step.label)).toEqual([
      'select-start',
      'move-right',
      'assert-moved-selection',
      'insert-after-navigation',
      'assert-inserted-text',
    ]);
    expect(result.replay.steps[0]?.value).toMatchObject({
      kind: 'select',
      selection: {
        anchor: { path: [0, 6], offset: 0 },
        focus: { path: [0, 6], offset: 0 },
      },
    });
    expect(result.trace.at(-1)?.snapshot.text).toContain('!G');
  });

  test('runs generated mixed editing conformance gauntlet without stale selection', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const result = await editor.scenario.run(
      'richtext-generated-mixed-editing-conformance-gauntlet',
      createPliteBrowserMixedEditingConformanceGauntlet({
        deleteKey: 'Backspace',
        domCaretAfterDelete: {
          offset: 1,
          text: '!',
        },
        domCaretAfterFollowUp: {
          offset: 1,
          text: "QSince it's rich text, you can do things like turn a selection of text ",
        },
        domShape: {
          afterDelete: {
            blockIndex: 0,
            innerText:
              'This is editable rich text, much better than a <textarea>!',
            noUnexpectedZeroWidthBreaks: true,
            textContent:
              'This is editable rich text, much better than a <textarea>!',
            zeroWidthBreakCount: 0,
          },
          afterFollowUp: {
            blockIndex: 1,
            noUnexpectedZeroWidthBreaks: true,
            zeroWidthBreakCount: 0,
          },
          afterInsert: {
            blockIndex: 0,
            innerText:
              'This is editable rich text, much better than a <textarea>!Q',
            noUnexpectedZeroWidthBreaks: true,
            textContent:
              'This is editable rich text, much better than a <textarea>!Q',
            zeroWidthBreakCount: 0,
          },
        },
        insertedText: 'Q',
        navigationKeys: ['ArrowRight'],
        selectionAfterDelete: {
          anchor: { path: [0, 6], offset: 1 },
          focus: { path: [0, 6], offset: 1 },
        },
        selectionAfterFollowUp: {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        },
        selectionAfterInsert: {
          anchor: { path: [0, 6], offset: 2 },
          focus: { path: [0, 6], offset: 2 },
        },
        selectionAfterNavigation: {
          anchor: { path: [0, 6], offset: 1 },
          focus: { path: [0, 6], offset: 1 },
        },
        startSelection: {
          anchor: { path: [0, 6], offset: 0 },
          focus: { path: [0, 6], offset: 0 },
        },
        textAfterDelete:
          'This is editable rich text, much better than a <textarea>!',
        textAfterFollowUp: "QSince it's rich text",
        textAfterInsert:
          'This is editable rich text, much better than a <textarea>!Q',
        toolbarButtonTestId: 'block-button-heading-one',
        toolbarSelection: {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
        toolbarSelectionAfterCommand: {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
      }),
      {
        metadata: {
          capabilities: [
            'caret',
            'delete',
            'dom-selection',
            'generated-gauntlet',
            'keyboard-navigation',
            'kernel-trace',
            'toolbar-command',
          ],
          platform: testInfo.project.name,
          transport: 'native-keyboard-and-dom-selection',
        },
        tracePath: testInfo.outputPath(
          'richtext-generated-mixed-editing-conformance-gauntlet.json'
        ),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.metadata.claim).toBe('desktop-native-keyboard');
    expect(result.replay.replayable).toBe(true);
    expect(
      result.reductionCandidates.every(
        (candidate) => candidate.replay.replayable
      )
    ).toBe(true);
    await expect(
      editor.root.locator('h1').filter({ hasText: "QSince it's rich text" })
    ).toHaveCount(1);
  });

  test('runs generated destructive paste and word-delete gauntlet', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const tailBlockTexts = [
      "Since it's rich text, you can do things like turn a selection of text bold, or add a semantically rendered block quote in the middle of the page, like this:",
      'A wise quote.',
      'Try it out for yourself!',
    ];
    const result = await editor.scenario.run(
      'richtext-generated-destructive-paste-word-delete-gauntlet',
      createPliteBrowserDestructiveEditingGauntlet({
        domShape: {
          afterDeleteAfterPaste: {
            blockIndex: 0,
            innerText:
              'Past is editable rich text, much better than a <textarea>!',
            noUnexpectedZeroWidthBreaks: true,
            textContent:
              'Past is editable rich text, much better than a <textarea>!',
            zeroWidthBreakCount: 0,
          },
          afterFollowUp: {
            blockIndex: 0,
            innerText:
              'Past! is editable rich text, much better than a <textarea>!',
            noUnexpectedZeroWidthBreaks: true,
            textContent:
              'Past! is editable rich text, much better than a <textarea>!',
            zeroWidthBreakCount: 0,
          },
          afterPaste: {
            blockIndex: 0,
            innerText:
              'Paste is editable rich text, much better than a <textarea>!',
            noUnexpectedZeroWidthBreaks: true,
            textContent:
              'Paste is editable rich text, much better than a <textarea>!',
            zeroWidthBreakCount: 0,
          },
          afterWordDeleteFollowUp: {
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            zeroWidthBreakCount: 0,
          },
          afterWordDeleteIterations: Array.from({ length: 4 }, () => ({
            blockIndex: 0,
            noUnexpectedZeroWidthBreaks: true,
            zeroWidthBreakCount: 0,
          })),
        },
        followUpText: '!',
        pasteSelection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        },
        pastedText: 'Paste',
        selectionAfterDeleteAfterPaste: {
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 4 },
        },
        selectionAfterFollowUp: {
          anchor: { path: [0, 0], offset: 5 },
          focus: { path: [0, 0], offset: 5 },
        },
        selectionAfterPaste: {
          anchor: { path: [0, 0], offset: 5 },
          focus: { path: [0, 0], offset: 5 },
        },
        tailBlockTextsAfterWordDelete: tailBlockTexts,
        textAfterDeleteAfterPaste:
          'Past is editable rich text, much better than a <textarea>!',
        textAfterFollowUp:
          'Past! is editable rich text, much better than a <textarea>!',
        textAfterPaste:
          'Paste is editable rich text, much better than a <textarea>!',
        wordDeleteSelection: {
          anchor: { path: [0, 6], offset: 1 },
          focus: { path: [0, 6], offset: 1 },
        },
      }),
      {
        metadata: {
          capabilities: [
            'delete',
            'generated-gauntlet',
            'kernel-trace',
            'paste',
            'word-delete',
          ],
          platform: testInfo.project.name,
          transport: 'native-keyboard-and-desktop-native-clipboard',
        },
        tracePath: testInfo.outputPath(
          'richtext-generated-destructive-paste-word-delete-gauntlet.json'
        ),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.metadata.claim).toBe('desktop-native-clipboard');
    expect(result.replay.replayable).toBe(true);
    expect(
      result.reductionCandidates.some(
        (candidate) =>
          candidate.kind === 'single-step' && candidate.replay.replayable
      )
    ).toBe(true);
    await expect
      .poll(async () => (await editor.get.blockTexts()).slice(1))
      .toEqual(tailBlockTexts);
  });

  test('runs generated mobile semantic editing conformance gauntlet', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'Mobile proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const result = await editor.scenario.run(
      'richtext-generated-mobile-semantic-editing-conformance-gauntlet',
      createPliteBrowserSemanticEditingConformanceGauntlet({
        insertedText: 'M',
        selectionAfterDelete: {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
        selectionAfterFollowUp: {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        },
        selectionAfterInsert: {
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        },
        startSelection: {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        },
        textAfterDelete:
          "Since it's rich text, you can do things like turn a selection of text",
        textAfterFollowUp: 'MThis is editable rich text',
        textAfterInsert:
          "MSince it's rich text, you can do things like turn a selection of text",
        toolbarButtonTestId: 'block-button-heading-one',
        toolbarSelection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        toolbarSelectionAfterCommand: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
      }),
      {
        metadata: {
          capabilities: [
            'delete',
            'dom-selection',
            'generated-gauntlet',
            'kernel-trace',
            'mobile-semantic',
            'toolbar-command',
          ],
          platform: testInfo.project.name,
          transport: 'semantic-handle-and-dom-selection',
        },
        tracePath: testInfo.outputPath(
          'richtext-generated-mobile-semantic-editing-conformance-gauntlet.json'
        ),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.metadata.claim).toBe('mobile-semantic-handle');
    expect(result.replay.replayable).toBe(true);
    await expect(
      editor.root
        .locator('h1')
        .filter({ hasText: 'MThis is editable rich text' })
    ).toHaveCount(1);
  });

  test('types at the browser-selected end of a block', async ({
    browserName,
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const expectedSelection = {
      anchor: { path: [0, 6], offset: 1 },
      focus: { path: [0, 6], offset: 1 },
    };

    await editor.click();
    if (browserName === 'firefox' || testInfo.project.name === 'mobile') {
      await editor.selection.select(expectedSelection);
      await expect
        .poll(() => editor.selection.get())
        .toEqual(expectedSelection);
      await expect
        .poll(() => editor.selection.dom())
        .toEqual({
          anchorOffset: 1,
          anchorNodeText: '!',
          focusNodeText: '!',
          focusOffset: 1,
        });
    } else {
      await selectEndOfFirstBlockWithDOMSelection(editor.root);
    }

    if (browserName === 'firefox' || testInfo.project.name === 'mobile') {
      await editor.insertText('ZZ');
    } else {
      await page.keyboard.insertText('ZZ');
    }

    await editor.assert.text(
      'This is editable rich text, much better than a <textarea>!ZZ'
    );
    await expect
      .poll(() => editor.get.modelText())
      .toContain(
        'This is editable rich text, much better than a <textarea>!ZZ'
      );
  });

  test('keeps caret editable after browser Backspace at selected text end', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Backspace proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const afterBackspaceText =
      'This is editable rich text, much better than a <textarea>!';
    const afterBackspaceSelection = {
      anchor: { path: [0, 6], offset: 1 },
      focus: { path: [0, 6], offset: 1 },
    };
    const afterFollowUpText =
      'This is editable rich text, much better than a <textarea>!Z';

    await editor.click();
    await editor.selection.select(afterBackspaceSelection);
    await page.keyboard.insertText('O');
    await editor.assert.text(
      'This is editable rich text, much better than a <textarea>!O'
    );
    await page.keyboard.press('Backspace');

    await editor.assert.text(afterBackspaceText);
    await expect
      .poll(() => editor.get.modelText())
      .toContain(afterBackspaceText);
    await expect
      .poll(() => editor.selection.get())
      .toEqual(afterBackspaceSelection);
    await expect
      .poll(() =>
        editor.root.evaluate((element: HTMLElement) => {
          const selection = element.ownerDocument.getSelection();

          return Boolean(
            selection?.isCollapsed &&
              selection.anchorNode &&
              selection.focusNode &&
              element.contains(selection.anchorNode) &&
              element.contains(selection.focusNode)
          );
        })
      )
      .toBe(true);

    await page.keyboard.type('Z');

    await editor.assert.text(afterFollowUpText);
    await expect
      .poll(() => editor.get.modelText())
      .toContain(afterFollowUpText);
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 6], offset: 2 },
        focus: { path: [0, 6], offset: 2 },
      });
    await expectDOMCaretAtTextEnd(editor.root, 'Z');
    await expectVisualCaretAtEndOfFirstBlock(editor.root);
  });

  test('keeps caret editable after browser Delete before trailing punctuation', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Delete proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const afterDeleteText =
      'This is editable rich text, much better than a <textarea>';
    const afterDeleteSelection = {
      anchor: { path: [0, 5], offset: '<textarea>'.length },
      focus: { path: [0, 5], offset: '<textarea>'.length },
    };
    const afterFollowUpText =
      'This is editable rich text, much better than a <textarea>Z';
    const afterFollowUpSelections = [
      {
        anchor: { path: [0, 5], offset: '<textarea>Z'.length },
        focus: { path: [0, 5], offset: '<textarea>Z'.length },
      },
      {
        anchor: { path: [0, 6], offset: 'Z'.length },
        focus: { path: [0, 6], offset: 'Z'.length },
      },
    ];

    await editor.click();
    await editor.selection.select(afterDeleteSelection);
    await page.keyboard.press('Delete');

    await editor.assert.text(afterDeleteText);
    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe(afterDeleteText);
    await expect.poll(() => editor.get.modelText()).toContain(afterDeleteText);
    await expect
      .poll(() => editor.selection.get())
      .toEqual(afterDeleteSelection);
    await expect
      .poll(() =>
        editor.root.evaluate((element: HTMLElement) => {
          const selection = element.ownerDocument.getSelection();

          return Boolean(
            selection?.isCollapsed &&
              selection.anchorNode &&
              selection.focusNode &&
              element.contains(selection.anchorNode) &&
              element.contains(selection.focusNode)
          );
        })
      )
      .toBe(true);

    await page.keyboard.insertText('Z');

    await editor.assert.text(afterFollowUpText);
    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe(afterFollowUpText);
    await expect
      .poll(() => editor.get.modelText())
      .toContain(afterFollowUpText);
    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        if (
          afterFollowUpSelections.some(
            (expectedSelection) =>
              selection?.anchor.offset === expectedSelection.anchor.offset &&
              selection.focus.offset === expectedSelection.focus.offset &&
              selection.anchor.path.join(',') ===
                expectedSelection.anchor.path.join(',') &&
              selection.focus.path.join(',') ===
                expectedSelection.focus.path.join(',')
          )
        ) {
          return 'expected';
        }

        return JSON.stringify(selection);
      })
      .toBe('expected');
    await expectDOMCaretAtTextEnd(editor.root, 'Z');
    await expectVisualCaretAtEndOfFirstBlock(editor.root);
  });

  test('deletes one character with Apple Control+D', async ({
    browser,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name === 'mobile',
      'Chromium desktop proof'
    );

    const context = await browser.newContext({
      baseURL,
      userAgent: macChromeUserAgent,
    });
    const page = await context.newPage();

    try {
      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });
      const initialFirstBlock = (await editor.get.blockTexts())[0]!;

      await editor.click();
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await page.keyboard.press('Control+D');

      await expect
        .poll(async () => (await editor.get.blockTexts())[0])
        .toBe(initialFirstBlock.slice(1));
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });
    } finally {
      await context.close();
    }
  });

  test('deletes one character backward with Apple Control+H', async ({
    browser,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name === 'mobile',
      'Chromium desktop proof'
    );

    const context = await browser.newContext({
      baseURL,
      userAgent: macChromeUserAgent,
    });
    const page = await context.newPage();

    try {
      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selectAll();
      await editor.deleteFragment();
      await editor.insertText('abc');
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 3 },
        focus: { path: [0, 0], offset: 3 },
      });
      await page.keyboard.press('Control+H');

      await expect
        .poll(async () => (await editor.get.blockTexts())[0])
        .toBe('ab');
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        });
    } finally {
      await context.close();
    }
  });

  test('keeps model and DOM coherent after persistent native word-delete', async ({
    browser,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name === 'mobile',
      'Chromium desktop proof'
    );

    const context = await browser.newContext({
      baseURL,
      userAgent: macChromeUserAgent,
    });
    const page = await context.newPage();

    try {
      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });
      const unchangedTailBlocks = [
        "Since it's rich text, you can do things like turn a selection of text bold, or add a semantically rendered block quote in the middle of the page, like this:",
        'A wise quote.',
        'Try it out for yourself!',
      ];

      await editor.click();
      await selectEndOfFirstBlockWithDOMSelection(editor.root);
      await editor.assert.domCaret({ offset: 1, text: '!' });

      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Alt+Backspace');

        await expect
          .poll(async () => (await editor.get.blockTexts()).slice(1))
          .toEqual(unchangedTailBlocks);
        await expectCollapsedDOMSelectionInsideEditable(editor.root);
      }

      await page.keyboard.insertText('Z');

      await expect
        .poll(async () => (await editor.get.blockTexts()).slice(1))
        .toEqual(unchangedTailBlocks);
      await expect
        .poll(async () => (await editor.get.blockTexts())[0]?.includes('Z'))
        .toBe(true);
      await expectCollapsedDOMSelectionInsideEditable(editor.root);
      await expect
        .poll(async () =>
          (await editor.get.kernelTrace()).some(
            (entry) =>
              (entry.eventFamily === 'keydown' ||
                entry.eventFamily === 'beforeinput') &&
              entry.command != null &&
              entry.command.kind === 'delete' &&
              entry.command.direction === 'backward' &&
              entry.command.unit === 'word'
          )
        )
        .toBe(true);
      await expect
        .poll(async () => {
          const trace = await editor.get.kernelTrace();
          const deleteEpochIds = trace
            .filter(
              (entry) =>
                (entry.eventFamily === 'keydown' ||
                  entry.eventFamily === 'beforeinput') &&
                entry.command?.kind === 'delete' &&
                entry.command.unit === 'word'
            )
            .map((entry) => entry.epochId);
          const repairSelectionchangeEpochIds = trace
            .filter(
              (entry) =>
                entry.eventFamily === 'selectionchange' &&
                entry.selectionChangeOrigin === 'repair-induced'
            )
            .map((entry) => entry.epochId);
          const deleteEpochIdSet = new Set(deleteEpochIds);
          const boundedRepairSelectionchangeCount =
            repairSelectionchangeEpochIds.length <= deleteEpochIdSet.size;
          const destructiveRepairSelectionchangeEpochIds =
            repairSelectionchangeEpochIds.filter((epochId) => epochId !== null);

          return {
            boundedRepairSelectionchangeCount,
            deleteEpochCount: deleteEpochIdSet.size,
            deleteEpochsArePresent: deleteEpochIds.every(
              (epochId) => epochId !== null
            ),
            repairEpochsJoinDeleteEpochs:
              destructiveRepairSelectionchangeEpochIds.every((epochId) =>
                deleteEpochIdSet.has(epochId)
              ),
            repairTracesJoinDeleteEpochs: [...deleteEpochIdSet].every(
              (epochId) =>
                epochId !== null &&
                trace.some(
                  (entry) =>
                    entry.eventFamily === 'repair' && entry.epochId === epochId
                )
            ),
            repairSelectionChangesStayModelOwned: trace
              .filter(
                (entry) =>
                  entry.eventFamily === 'selectionchange' &&
                  entry.selectionChangeOrigin === 'repair-induced'
              )
              .every((entry) => entry.ownership === 'model-owned'),
          };
        })
        .toEqual({
          boundedRepairSelectionchangeCount: true,
          deleteEpochCount: 4,
          deleteEpochsArePresent: true,
          repairEpochsJoinDeleteEpochs: true,
          repairTracesJoinDeleteEpochs: true,
          repairSelectionChangesStayModelOwned: true,
        });
    } finally {
      await context.close();
    }
  });

  test('keeps rendered DOM shape after repeated leaf-boundary word-delete', async ({
    browser,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name === 'mobile',
      'Chromium desktop proof'
    );

    const context = await browser.newContext({
      baseURL,
      userAgent: macChromeUserAgent,
      viewport: { height: 560, width: 383 },
    });
    const page = await context.newPage();

    try {
      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });
      const unchangedTailBlocks = [
        "Since it's rich text, you can do things like turn a selection of text bold, or add a semantically rendered block quote in the middle of the page, like this:",
        'A wise quote.',
        'Try it out for yourself!',
      ];

      await editor.click();
      await selectEndOfFirstBlockWithDOMSelection(editor.root);
      await editor.assert.domCaret({ offset: 1, text: '!' });

      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Alt+Backspace');

        await expect
          .poll(async () => (await editor.get.blockTexts()).slice(1))
          .toEqual(unchangedTailBlocks);
      }

      const firstBlockModelText = (await editor.get.blockTexts())[0] ?? '';

      await editor.assert.renderedDOMShape({
        blockIndex: 0,
        innerText: firstBlockModelText,
        noUnexpectedZeroWidthBreaks: true,
        textContent: firstBlockModelText,
        zeroWidthBreakCount: 0,
        zeroWidthCount: 0,
      });

      await expectCollapsedDOMSelectionInsideEditable(editor.root);
      await page.keyboard.insertText('Z');
      await expect
        .poll(async () => (await editor.get.blockTexts())[0])
        .toContain('Z');
    } finally {
      await context.close();
    }
  });

  test('keeps caret editable after browser Backspace deletes selected range', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Backspace proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const afterDeleteText =
      ' is editable rich text, much better than a <textarea>!';
    const afterDeleteSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const afterFollowUpText =
      'Z is editable rich text, much better than a <textarea>!';

    await editor.click();
    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });
    await page.keyboard.press('Backspace');

    await editor.assert.text(afterDeleteText);
    await expect.poll(() => editor.get.modelText()).toContain(afterDeleteText);
    await expect
      .poll(() => editor.selection.get())
      .toEqual(afterDeleteSelection);
    await editor.assert.domCaret({ offset: 0, text: ' is editable ' });

    await page.keyboard.insertText('Z');

    await editor.assert.text(afterFollowUpText);
    await expect
      .poll(() => editor.get.modelText())
      .toContain(afterFollowUpText);
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    await editor.assert.domCaret({ offset: 1, text: 'Z is editable ' });
  });

  test('keeps caret editable after browser Delete deletes selected range', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Delete proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const afterDeleteText =
      ' is editable rich text, much better than a <textarea>!';
    const afterDeleteSelection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const afterFollowUpText =
      'Z is editable rich text, much better than a <textarea>!';

    await editor.click();
    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });
    await page.keyboard.press('Delete');

    await editor.assert.text(afterDeleteText);
    await expect.poll(() => editor.get.modelText()).toContain(afterDeleteText);
    await expect
      .poll(() => editor.selection.get())
      .toEqual(afterDeleteSelection);
    await editor.assert.domCaret({ offset: 0, text: ' is editable ' });

    await page.keyboard.insertText('Z');

    await editor.assert.text(afterFollowUpText);
    await expect
      .poll(() => editor.get.modelText())
      .toContain(afterFollowUpText);
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    await editor.assert.domCaret({ offset: 1, text: 'Z is editable ' });
  });

  test('keeps selection synchronized after browser ArrowLeft and ArrowRight', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop arrow-key proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await editor.selection.select({
      anchor: { path: [0, 6], offset: 1 },
      focus: { path: [0, 6], offset: 1 },
    });
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 6], offset: 1 },
        focus: { path: [0, 6], offset: 1 },
      });
    await page.keyboard.press('ArrowLeft');

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 6], offset: 0 },
        focus: { path: [0, 6], offset: 0 },
      });
    await expectDOMCaretAfterInsertedTextBeforeSuffix(editor.root, '', '!');

    await page.keyboard.press('ArrowRight');

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 6], offset: 1 },
        focus: { path: [0, 6], offset: 1 },
      });
    await expectDOMCaretAtTextEnd(editor.root, '!');
  });

  test('maps uppercase text-transform glyph selection to source text offsets', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop visual hit-testing proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await page.addStyleTag({
      content: '[data-plite-editor] h2 { text-transform: uppercase; }',
    });
    await editor.selectAll();
    await editor.deleteFragment();
    const headingText = 'Heise';
    await editor.insertText(headingText);
    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: headingText.length },
    });
    await page.getByTestId('block-button-heading-two').click();
    await expect(editor.root.locator('h2')).toHaveCSS(
      'text-transform',
      'uppercase'
    );
    await editor.selection.collapse({
      path: [0, 0],
      offset: headingText.length,
    });

    const finalSourceCharacterRect = await editor.root
      .locator('h2 [data-plite-node="text"]')
      .first()
      .evaluate((node) => {
        const walker = node.ownerDocument.createTreeWalker(
          node,
          NodeFilter.SHOW_TEXT
        );
        const textNode = walker.nextNode();

        if (!textNode?.textContent) {
          throw new Error('Expected heading text node');
        }

        const range = node.ownerDocument.createRange();

        range.setStart(textNode, textNode.textContent.length - 1);
        range.setEnd(textNode, textNode.textContent.length);

        const rect = range.getBoundingClientRect();

        return {
          endX: rect.right - 1,
          startX: rect.left + 1,
          y: rect.top + rect.height / 2,
        };
      });

    await page.mouse.move(
      finalSourceCharacterRect.endX,
      finalSourceCharacterRect.y
    );
    await page.mouse.down();
    await page.mouse.move(
      finalSourceCharacterRect.startX,
      finalSourceCharacterRect.y,
      { steps: 4 }
    );
    await page.mouse.up();

    await expect
      .poll(async () => (await editor.get.selectedText()).toLowerCase())
      .toBe('e');
    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        if (!selection) {
          return null;
        }

        return [selection.anchor.offset, selection.focus.offset].sort(
          (left, right) => left - right
        );
      })
      .toEqual([4, 5]);
  });

  test('keeps ArrowDown then ArrowRight in the browser-selected paragraph', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop navigation proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await editor.assert.domCaret({ offset: 0, text: 'This is editable ' });

    await page.keyboard.press('ArrowDown');
    await expect
      .poll(() => editor.selection.dom())
      .toEqual({
        anchorOffset: 0,
        anchorNodeText:
          "Since it's rich text, you can do things like turn a selection of text ",
        focusNodeText:
          "Since it's rich text, you can do things like turn a selection of text ",
        focusOffset: 0,
      });
    await expect
      .poll(() => editor.get.kernelTrace())
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            eventFamily: 'keydown',
            movement: expect.objectContaining({
              axis: 'vertical',
              key: 'ArrowDown',
              ownership: 'native-allowed',
              reason: 'native-vertical-layout',
            }),
          }),
        ])
      );

    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 1 },
      });
    await editor.assert.domCaret({
      offset: 1,
      text: "Since it's rich text, you can do things like turn a selection of text ",
    });
  });

  test('keeps DOM caret synced after ArrowUp across paragraphs', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop navigation proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await editor.selection.selectDOM({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    await editor.assert.domCaret({
      offset: 0,
      text: "Since it's rich text, you can do things like turn a selection of text ",
    });

    await page.keyboard.press('ArrowUp');

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    await editor.assert.domCaret({ offset: 0, text: 'This is editable ' });
    await expect
      .poll(() => editor.get.kernelTrace())
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            eventFamily: 'keydown',
            movement: expect.objectContaining({
              axis: 'vertical',
              key: 'ArrowUp',
              ownership: 'native-allowed',
              reason: 'native-vertical-layout',
            }),
          }),
        ])
      );
  });

  test('keeps navigation and mutation chained through browser editing state', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop navigation proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    const result = await editor.scenario.run(
      'richtext-navigation-mutation-gauntlet',
      [
        {
          kind: 'rootClick',
          label: 'activate-before-navigation-chain',
        },
        {
          kind: 'selectDOM',
          label: 'select-dom-navigation-start',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          },
        },
        {
          key: 'ArrowDown',
          kind: 'press',
          label: 'navigate-arrow-down',
        },
        {
          kind: 'assertSelectionLocation',
          label: 'assert-after-arrow-down',
          location: {
            anchorOffset: 0,
            anchorPath: [1, 0],
            anchorText:
              "Since it's rich text, you can do things like turn a selection of text ",
            isCollapsed: true,
          },
        },
        {
          key: 'ArrowRight',
          kind: 'press',
          label: 'navigate-arrow-right-after-down',
        },
        {
          kind: 'assertSelection',
          label: 'assert-after-arrow-right-after-down',
          selection: {
            anchor: { path: [1, 0], offset: 1 },
            focus: { path: [1, 0], offset: 1 },
          },
        },
        {
          kind: 'assertSelectionLocation',
          label: 'assert-dom-after-arrow-right-after-down',
          location: {
            anchorOffset: 1,
            anchorPath: [1, 0],
            anchorText:
              "Since it's rich text, you can do things like turn a selection of text ",
            isCollapsed: true,
          },
        },
        {
          kind: 'settle',
          label: 'settle-native-caret-before-arrow-up',
        },
        {
          key: 'ArrowUp',
          kind: 'press',
          label: 'navigate-arrow-up',
        },
        {
          kind: 'assertSelectionLocation',
          label: 'assert-after-arrow-up',
          location: {
            anchorPath: [0, 0],
            anchorText: 'This is editable ',
          },
        },
        {
          key: 'ArrowRight',
          kind: 'press',
          label: 'navigate-arrow-right-after-up',
        },
        {
          kind: 'assertSelectionLocation',
          label: 'assert-stays-in-block-after-arrow-right',
          location: {
            anchorPath: [0, 0],
            anchorText: 'This is editable ',
          },
        },
        {
          kind: 'select',
          label: 'select-insert-backspace-start',
          selection: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 4 },
          },
        },
        {
          kind: 'assertSelection',
          label: 'assert-insert-backspace-start',
          selection: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 4 },
          },
        },
        {
          kind: 'type',
          label: 'type-before-backspace',
          text: 'Q',
        },
        {
          kind: 'assertSelection',
          label: 'assert-after-type-before-backspace',
          selection: {
            anchor: { path: [0, 0], offset: 5 },
            focus: { path: [0, 0], offset: 5 },
          },
        },
        {
          kind: 'assertDOMCaret',
          label: 'assert-caret-after-type-before-backspace',
          offset: 5,
          text: 'ThisQ is editable ',
        },
        {
          key: 'Backspace',
          kind: 'press',
          label: 'backspace-after-type',
        },
        {
          kind: 'assertSelection',
          label: 'assert-after-backspace',
          selection: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 4 },
          },
        },
        {
          kind: 'assertDOMCaret',
          label: 'assert-caret-after-backspace',
          offset: 4,
          text: 'This is editable ',
        },
        {
          kind: 'select',
          label: 'select-delete-type-undo-range',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 4 },
          },
        },
        {
          key: 'Delete',
          kind: 'press',
          label: 'delete-selected-range',
        },
        {
          kind: 'assertSelection',
          label: 'assert-after-delete-selected-range',
          selection: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          },
        },
        {
          kind: 'assertDOMCaret',
          label: 'assert-caret-after-delete-selected-range',
          offset: 0,
          text: ' is editable ',
        },
        {
          caretAfterType: {
            offset: 1,
            text: 'Z is editable ',
          },
          caretAfterUndo: {
            offset: 0,
            text: ' is editable ',
          },
          expectedModelTextAfterType: 'Z is editable rich text',
          expectedModelTextAfterUndo: ' is editable rich text',
          kind: 'typeThenUndo',
          label: 'type-and-undo-after-selected-delete',
          text: 'Z',
        },
      ],
      {
        metadata: {
          capabilities: [
            'dom-selection',
            'keyboard-navigation',
            'model-selection',
            'text-mutation',
            'undo',
          ],
          platform: testInfo.project.name,
          transport: 'native-keyboard',
        },
        tracePath: testInfo.outputPath(
          'richtext-navigation-mutation-gauntlet.json'
        ),
      }
    );

    expect(result.metadata).toEqual({
      capabilities: [
        'dom-selection',
        'keyboard-navigation',
        'model-selection',
        'text-mutation',
        'undo',
      ],
      claim: 'desktop-native-keyboard',
      platform: testInfo.project.name,
      transport: 'native-keyboard',
    });
    expect(result.replay.replayable).toBe(true);
    expect(result.trace.map((entry) => entry.label)).toEqual([
      'activate-before-navigation-chain',
      'select-dom-navigation-start',
      'navigate-arrow-down',
      'assert-after-arrow-down',
      'navigate-arrow-right-after-down',
      'assert-after-arrow-right-after-down',
      'assert-dom-after-arrow-right-after-down',
      'settle-native-caret-before-arrow-up',
      'navigate-arrow-up',
      'assert-after-arrow-up',
      'navigate-arrow-right-after-up',
      'assert-stays-in-block-after-arrow-right',
      'select-insert-backspace-start',
      'assert-insert-backspace-start',
      'type-before-backspace',
      'assert-after-type-before-backspace',
      'assert-caret-after-type-before-backspace',
      'backspace-after-type',
      'assert-after-backspace',
      'assert-caret-after-backspace',
      'select-delete-type-undo-range',
      'delete-selected-range',
      'assert-after-delete-selected-range',
      'assert-caret-after-delete-selected-range',
      'type-and-undo-after-selected-delete',
    ]);
  });

  test('records kernel commands for structural browser edits', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 0], offset: 4 });
    await editor.press('Backspace');
    await editor.press('Enter');

    const commands = (await editor.get.kernelTrace()).map(
      (entry) =>
        (
          entry as {
            command?: Record<string, unknown> | null;
          }
        ).command
    );

    expect(commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          direction: 'backward',
          kind: 'delete',
        }),
        expect.objectContaining({
          kind: 'insert-break',
          variant: 'paragraph',
        }),
      ])
    );
  });

  test('records a soft break command for Shift+Enter', async ({ page }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 0], offset: 4 });
    await editor.press('Shift+Enter');

    const commands = (await editor.get.kernelTrace()).map(
      (entry) =>
        (
          entry as {
            command?: Record<string, unknown> | null;
          }
        ).command
    );

    expect(commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'insert-break',
          variant: 'soft',
        }),
      ])
    );
  });

  test('opens a line with Mac Ctrl+O without moving past following text', async ({
    browser,
    browserName,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name === 'mobile',
      'Chromium desktop proof'
    );

    const context = await browser.newContext({
      baseURL,
      userAgent: macChromeUserAgent,
    });
    const page = await context.newPage();

    try {
      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText('foo');
      await page.keyboard.press('Enter');
      await page.keyboard.insertText('bar');
      await editor.selection.collapse({ path: [1, 0], offset: 0 });

      await editor.assert.blockTexts(['foo', 'bar']);
      await editor.assert.selection({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      await page.keyboard.press('Control+KeyO');

      await editor.assert.blockTexts(['foo', '', 'bar']);
      await editor.assert.selection({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
      await expect
        .poll(() => editor.selection.location())
        .toMatchObject({
          anchorOffset: 0,
          anchorPath: [1, 0],
          isCollapsed: true,
        });

      const commands = (await editor.get.kernelTrace()).map(
        (entry) =>
          (
            entry as {
              command?: Record<string, unknown> | null;
            }
          ).command
      );

      expect(commands).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'insert-break',
            variant: 'open-line',
          }),
        ])
      );
    } finally {
      await context.close();
    }
  });

  test('opens and rejoins a line before emoji text', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const emojiText = '🙂or🙁';
    const mobile = testInfo.project.name === 'mobile';

    await editor.selection.selectAll();
    if (mobile) {
      await editor.deleteFragment();
      await editor.insertText(emojiText);
      await editor.selection.collapse({ path: [0, 0], offset: 0 });
      await editor.insertBreak();
    } else {
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText(emojiText);
      await editor.selection.selectDOM({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await page.keyboard.press('Enter');
    }

    await editor.assert.blockTexts(['', emojiText]);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    if (mobile) {
      await editor.deleteBackward();
    } else {
      await page.keyboard.press('Backspace');
    }

    await editor.assert.blockTexts([emojiText]);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  test('splits after a programmatically inserted emoji without breaking it', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Enter key proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const emoji = '🙂';
    const text = `${emoji}after`;

    await editor.selection.selectAll();
    await page.keyboard.press('Backspace');
    await editor.insertText(text);
    await editor.selection.collapse({
      path: [0, 0],
      offset: emoji.length,
    });
    await editor.focus();
    await page.keyboard.press('Enter');

    await editor.assert.blockTexts([emoji, 'after']);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  test('records kernel commands for proof-handle edits', async ({ page }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 0], offset: 4 });
    await editor.insertText('Z');
    await editor.deleteBackward();
    await editor.insertBreak();

    const commands = (await editor.get.kernelTrace()).map(
      (entry) =>
        (
          entry as {
            command?: Record<string, unknown> | null;
          }
        ).command
    );

    expect(commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'insert-text',
          text: 'Z',
        }),
        expect.objectContaining({
          direction: 'backward',
          kind: 'delete',
        }),
        expect.objectContaining({
          kind: 'insert-break',
          variant: 'paragraph',
        }),
      ])
    );
  });

  test('records allowed kernel transitions for movement commands', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 6], offset: 0 });
    await editor.press('ArrowRight');

    const movementTrace = (await editor.get.kernelTrace()).find(
      (entry) =>
        (
          entry as {
            command?: { kind?: string } | null;
          }
        ).command?.kind === 'move-selection'
    ) as
      | {
          transition?: {
            allowed?: boolean;
            reason?: string | null;
          };
        }
      | undefined;

    expect(movementTrace?.transition).toEqual({
      allowed: true,
      reason: null,
    });
  });

  test('records core command metadata for keydown movement', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.collapse({ path: [0, 6], offset: 0 });
    await editor.press('ArrowRight');

    const lastCommit = (await editor.get.lastCommit()) as {
      command?: { origin?: string; type?: string } | null;
    } | null;

    expect(lastCommit?.command).toEqual({
      origin: 'command',
      type: 'move_selection',
    });
  });

  test('records kernel policies for browser command and repair traces', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const mobile = testInfo.project.name === 'mobile';

    await editor.selection.collapse({ path: [0, 6], offset: 0 });
    await editor.press('ArrowRight');

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });
    if (mobile) {
      await editor.insertText('P');
    } else {
      await editor.page.keyboard.type('P');
    }

    const trace = await editor.get.kernelTrace();
    const moveTrace = trace.find(
      (entry) =>
        (
          entry as {
            command?: { kind?: string } | null;
          }
        ).command?.kind === 'move-selection'
    ) as
      | {
          repairPolicy?: unknown;
          selectionPolicy?: unknown;
        }
      | undefined;
    const repairTrace = [...trace].reverse().find(
      (entry) =>
        (
          entry as {
            eventFamily?: string;
          }
        ).eventFamily === 'repair'
    ) as
      | {
          repairPolicy?: unknown;
          selectionPolicy?: unknown;
        }
      | undefined;

    expect(moveTrace?.selectionPolicy).toEqual({
      kind: 'preserve-model',
      reason: 'model-owned',
    });
    expect(moveTrace?.repairPolicy).toEqual({
      kind: 'none',
      reason: 'not-requested',
    });
    if (!mobile) {
      expect(repairTrace?.selectionPolicy).toEqual({
        kind: 'preserve-model',
        reason: 'model-owned',
      });
      expect(repairTrace?.repairPolicy).toEqual({
        kind: 'repair-caret',
        reason: 'repair-caret-after-text-insert',
      });
    }
  });

  test('runs generated mark typing gauntlet without illegal kernel transitions', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile' || testInfo.project.name === 'webkit',
      'Desktop Chromium/Firefox generated mark gauntlet proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    const result = await editor.scenario.run(
      'richtext-generated-mark-typing-gauntlet',
      createPliteBrowserMarkTypingGauntlet({
        hotkey: 'Control+b',
        insertedText: 'MARK',
        selection: {
          anchor: { path: [0, 0], offset: 4 },
          focus: { path: [0, 0], offset: 4 },
        },
        textAfterInsert: 'MARK',
      }),
      {
        metadata: {
          capabilities: ['format', 'kernel-trace', 'mark'],
          platform: testInfo.project.name,
          transport: 'keyboard-and-handle',
        },
        tracePath: testInfo.outputPath('richtext-mark-typing-gauntlet.json'),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.metadata.claim).toBe('mixed-native-and-semantic');
    expect(result.replay.replayable).toBe(true);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'MARK' })
    ).toHaveCount(1);
  });

  test('keeps browser caret valid after marking selected text then clicking elsewhere', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile' || testInfo.project.name === 'webkit',
      'Desktop Chromium/Firefox mark-caret proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const result = await editor.scenario.run(
      'richtext-generated-mark-click-typing-gauntlet',
      createPliteBrowserMarkClickTypingGauntlet({
        clickPoint: { path: [1, 2], offset: 6 },
        domCaretAfterInsert: {
          offset: 7,
          text: ', you Ocan do things like turn a selection of text ',
        },
        hotkey: 'Control+b',
        insertedText: 'O',
        markSelection: {
          anchor: { path: [1, 0], offset: 16 },
          focus: { path: [1, 0], offset: 20 },
        },
        selectionTransport: 'dom',
        selectionAfterInsert: {
          anchor: { path: [1, 2], offset: 7 },
          focus: { path: [1, 2], offset: 7 },
        },
        textAfterInsert:
          "Since it's rich text, you Ocan do things like turn a selection of text",
      }),
      {
        metadata: {
          capabilities: [
            'dom-selection',
            'generated-gauntlet',
            'mark',
            'runtime-error-guard',
          ],
          platform: testInfo.project.name,
          transport: 'native-keyboard-and-click',
        },
        tracePath: testInfo.outputPath('richtext-mark-click-gauntlet.json'),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.replay.replayable).toBe(true);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'text' })
    ).toHaveCount(1);
  });

  test('keeps browser caret valid after toolbar marking selected text then clicking elsewhere', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop mark-caret proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const result = await editor.scenario.run(
      'richtext-toolbar-mark-click-caret-conformance',
      createPliteBrowserToolbarMarkClickTypingGauntlet({
        clickPoint: { path: [1, 2], offset: 6 },
        domCaretAfterInsert: {
          offset: 7,
          text: ', you Ocan do things like turn a selection of text ',
        },
        insertedText: 'O',
        markButtonTestId: 'mark-button-bold',
        markSelection: {
          anchor: { path: [1, 0], offset: 16 },
          focus: { path: [1, 0], offset: 20 },
        },
        selectionAfterInsert: {
          anchor: { path: [1, 2], offset: 7 },
          focus: { path: [1, 2], offset: 7 },
        },
        textAfterInsert:
          "Since it's rich text, you Ocan do things like turn a selection of text",
      }),
      {
        metadata: {
          capabilities: [
            'caret',
            'dom-selection',
            'generated-gauntlet',
            'mark',
            'runtime-error-guard',
            'toolbar-command',
          ],
          platform: testInfo.project.name,
          transport: 'native-click-and-keyboard',
        },
        tracePath: testInfo.outputPath(
          'richtext-toolbar-mark-click-caret-conformance.json'
        ),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.replay.replayable).toBe(true);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'text' })
    ).toHaveCount(1);
  });

  test('keeps browser caret valid after native word selection toolbar mark then clicking elsewhere', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop mark-caret proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const result = await editor.scenario.run(
      'richtext-native-word-toolbar-mark-click-caret-conformance',
      [
        {
          kind: 'doubleClickTextOffset',
          label: 'native-select-word',
          offset: 18,
          path: [1, 0],
          selectedText: 'text',
        },
        {
          kind: 'assertSelectedText',
          label: 'assert-native-selected-word',
          text: 'text',
        },
        {
          kind: 'assertWindowSelectionText',
          label: 'assert-window-selected-word',
          text: 'text',
        },
        {
          kind: 'assertSelection',
          label: 'assert-model-selected-word',
          selection: {
            anchor: { offset: 16, path: [1, 0] },
            focus: { offset: 20, path: [1, 0] },
          },
        },
        {
          kind: 'clickTestId',
          label: 'toggle-mark-from-toolbar',
          testId: 'mark-button-bold',
        },
        {
          kind: 'clickTextOffset',
          label: 'click-after-toolbar-mark-split',
          offset: 6,
          path: [1, 2],
        },
        {
          kind: 'type',
          label: 'type-after-toolbar-mark-click',
          text: 'O',
        },
        {
          kind: 'assertKernelTrace',
          label: 'assert-repair-trace-after-toolbar-mark-click',
          trace: {
            eventFamily: 'repair',
            repairPolicy: { kind: 'repair-caret' },
            transition: { allowed: true },
          },
        },
        {
          kind: 'assertText',
          label: 'assert-text-after-toolbar-mark-click',
          text: "Since it's rich text, you Ocan do things like turn a selection of text",
        },
        {
          kind: 'assertSelection',
          label: 'assert-selection-after-toolbar-mark-click',
          selection: {
            anchor: { path: [1, 2], offset: 7 },
            focus: { path: [1, 2], offset: 7 },
          },
        },
        {
          focusOwner: 'editor',
          kind: 'assertFocusOwner',
          label: 'assert-editor-focus-after-toolbar-mark-click',
        },
        {
          kind: 'assertLastCommit',
          label: 'assert-commit-after-toolbar-mark-click',
        },
        {
          kind: 'assertDOMCaret',
          label: 'assert-dom-caret-after-toolbar-mark-click',
          offset: 7,
          text: ', you Ocan do things like turn a selection of text ',
        },
      ],
      {
        metadata: {
          capabilities: [
            'caret',
            'dom-selection',
            'mark',
            'native-word-selection',
            'runtime-error-guard',
            'toolbar-command',
          ],
          platform: testInfo.project.name,
          transport: 'native-click-and-keyboard',
        },
        tracePath: testInfo.outputPath(
          'richtext-native-word-toolbar-mark-click-caret-conformance.json'
        ),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.replay.replayable).toBe(true);
    await expect(
      editor.root.locator('strong').filter({ hasText: 'text' })
    ).toHaveCount(1);
  });

  test('applies toolbar heading to the browser-selected paragraph', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop browser paragraph selection proof'
    );

    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.selection.collapse({ path: [0, 0], offset: 0 });
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await editor.root.dispatchEvent('mousedown');
      await editor.selection.selectDOM({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
      await expect
        .poll(() => editor.selection.location())
        .toMatchObject({
          anchorOffset: 0,
          anchorPath: [1, 0],
          isCollapsed: true,
        });

      await page.getByTestId('block-button-heading-one').click();

      runtimeErrors.assertNone();
      expect(
        await page
          .locator('[data-plite-editor] h1')
          .filter({ hasText: "Since it's rich text" })
          .count()
      ).toBe(1);
      expect(
        await page
          .locator('[data-plite-editor] h1')
          .filter({ hasText: 'This is editable rich text' })
          .count()
      ).toBe(0);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });

      await page.keyboard.type('Q');

      await editor.assert.text("QSince it's rich text");
      await expect
        .poll(() => editor.get.text())
        .toContain("QSince it's rich text");
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 1 },
          focus: { path: [1, 0], offset: 1 },
        });
      await editor.assert.domCaret({
        offset: 1,
        text: "QSince it's rich text, you can do things like turn a selection of text ",
      });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('runs toolbar block commands on pointerdown', async ({ page }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const root = page.locator('[data-plite-editor]');
    const pointerDown = async (testId: string) => {
      await page.getByTestId(testId).dispatchEvent('pointerdown', {
        button: 0,
        buttons: 1,
        pointerType: 'mouse',
      });
    };

    try {
      await editor.selection.collapse({ path: [0, 0], offset: 0 });

      await pointerDown('block-button-heading-one');
      const headingOne = root
        .locator('h1')
        .filter({ hasText: 'This is editable rich text' });
      await expect(headingOne).toHaveCount(1);
      await expect(headingOne).toHaveCSS('font-size', '32px');
      await expect(headingOne).toHaveCSS('font-weight', '700');

      await pointerDown('block-button-heading-two');
      await expect(root.locator('h1')).toHaveCount(0);
      const headingTwo = root
        .locator('h2')
        .filter({ hasText: 'This is editable rich text' });
      await expect(headingTwo).toHaveCount(1);
      await expect(headingTwo).toHaveCSS('font-size', '24px');
      await expect(headingTwo).toHaveCSS('font-weight', '700');

      await pointerDown('block-button-numbered-list');
      const numberedList = root.locator('ol');
      await expect(numberedList).toHaveCSS('list-style-type', 'decimal');
      await expect(numberedList).toHaveCSS('padding-left', '24px');
      await expect(
        numberedList.locator('> li').filter({
          hasText: 'This is editable rich text',
        })
      ).toHaveCount(1);

      await pointerDown('block-button-bulleted-list');
      const bulletedList = root.locator('ul');
      await expect(bulletedList).toHaveCSS('list-style-type', 'disc');
      await expect(bulletedList).toHaveCSS('padding-left', '24px');
      await expect(
        bulletedList.locator('> li').filter({
          hasText: 'This is editable rich text',
        })
      ).toHaveCount(1);

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('ignores a native selection that starts outside the editor and ends inside it', async ({
    page,
  }) => {
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.selection.collapse({ path: [0, 0], offset: 0 });
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await editor.focus();

      await editor.root.evaluate((element: HTMLElement) => {
        const outside = element.ownerDocument.createElement('p');
        outside.dataset.testid = 'outside-selection-source';
        outside.textContent = 'outside selection source';
        element.parentElement?.insertBefore(outside, element);

        const editorText = element.querySelector(
          '[data-plite-string]'
        )?.firstChild;
        const outsideText = outside.firstChild;

        if (!editorText || !outsideText) {
          throw new Error('Cannot create outside-to-editor selection');
        }

        const range = element.ownerDocument.createRange();
        range.setStart(outsideText, 0);
        range.setEnd(editorText, 4);

        const selection = element.ownerDocument.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        element.ownerDocument.dispatchEvent(
          new Event('selectionchange', { bubbles: true })
        );
      });
      await page.waitForTimeout(150);

      runtimeErrors.assertNone();
      await editor.click();
      await page.keyboard.type('Z');
      await expect.poll(() => editor.get.modelText()).toContain('Z');
    } finally {
      runtimeErrors.stop();
    }
  });

  test('repairs cursor movement after the native selection range is cleared', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop null native-selection proof'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.selection.selectDOM({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      await editor.root.evaluate((element: HTMLElement) => {
        const selection = element.ownerDocument.getSelection();

        if (!selection) {
          throw new Error('Missing browser selection');
        }

        selection.removeAllRanges();
        element.ownerDocument.dispatchEvent(
          new Event('selectionchange', { bubbles: true })
        );
      });

      await expect
        .poll(() =>
          editor.root.evaluate(
            (element: HTMLElement) =>
              element.ownerDocument.getSelection()?.rangeCount ?? -1
          )
        )
        .toBe(0);
      runtimeErrors.assertNone();

      await page.keyboard.press('ArrowRight');

      runtimeErrors.assertNone();
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        });
      await editor.assert.domCaret({
        offset: 1,
        text: 'This is editable ',
      });

      await page.keyboard.type('Z');

      runtimeErrors.assertNone();
      await expect.poll(() => editor.get.modelText()).toContain('TZhis');
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('applies toolbar heading from browser target even when model selection is already heading', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });
      await page.getByTestId('block-button-heading-one').click();
      await expect(
        page
          .locator('[data-plite-editor] h1')
          .filter({ hasText: 'This is editable rich text' })
      ).toHaveCount(1);

      await editor.root.dispatchEvent('mousedown');
      await editor.selection.selectDOM({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
      await expect
        .poll(() => editor.selection.location())
        .toMatchObject({
          anchorOffset: 0,
          anchorPath: [1, 0],
          isCollapsed: true,
        });

      await page.getByTestId('block-button-heading-one').click();

      runtimeErrors.assertNone();
      await expect(page.locator('[data-plite-editor] h1')).toHaveCount(2);
      await expect(
        page
          .locator('[data-plite-editor] h1')
          .filter({ hasText: "Since it's rich text" })
      ).toHaveCount(1);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps the first heading unchanged on Backspace at the start', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('Welcome to the playground');
    await page.getByTestId('block-button-heading-one').click();
    await expect(editor.root.locator('h1')).toHaveText(
      'Welcome to the playground'
    );

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.press('Backspace');

    await expect(editor.root.locator('h1')).toHaveText(
      'Welcome to the playground'
    );
    await expect(editor.root.locator('p')).toHaveCount(0);
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
  });

  test('handles heading Enter behavior from the browser', async ({ page }) => {
    const setSingleHeading = async (text: string) => {
      await page.goto('/examples/plite/richtext');
      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selectAll();
      await editor.deleteFragment();
      await editor.insertText(text);
      await page.getByTestId('block-button-heading-one').click();
      await expect(editor.root.locator('h1')).toContainText(text);

      return editor;
    };

    let editor = await setSingleHeading('hello world');
    await editor.selection.collapse({ path: [0, 0], offset: 'hello'.length });
    await editor.press('Enter');

    await expect(editor.root.locator('h1')).toHaveCount(2);
    await expect(editor.root.locator('h1').nth(0)).toContainText('hello');
    await expect(editor.root.locator('h1').nth(1)).toContainText(' world');

    editor = await setSingleHeading('done');
    await editor.selection.collapse({ path: [0, 0], offset: 'done'.length });
    await editor.press('Enter');

    await expect(editor.root.locator('h1')).toHaveCount(1);
    await expect(editor.root.locator('h1')).toContainText('done');
    await expect(editor.root.locator('p')).toHaveCount(1);

    await page.goto('/examples/plite/richtext');
    editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    await editor.selectAll();
    await editor.deleteFragment();
    await page.getByTestId('block-button-heading-one').click();
    await expect(editor.root.locator('h1')).toHaveCount(1);
    await editor.press('Enter');

    await expect(editor.root.locator('h1')).toHaveCount(1);
    await expect(editor.root.locator('p')).toHaveCount(1);
  });

  test('pastes a copied heading into an empty paragraph as a heading', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop structured clipboard proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('Copied heading');
    await page.getByTestId('block-button-heading-one').click();
    await expect(editor.root.locator('h1')).toHaveText('Copied heading');

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'Copied heading'.length },
    });
    let payload = await editor.clipboard.copyEventPayload();

    if (payload.html === null) {
      payload = await editor.clipboard.copyPayload();
    }

    if (payload.html === null) {
      throw new Error('Expected copied heading payload to include HTML');
    }

    await editor.selection.collapse({
      path: [0, 0],
      offset: 'Copied heading'.length,
    });
    await editor.press('Enter');
    await editor.selection.collapse({ path: [1, 0], offset: 0 });
    await editor.clipboard.pasteEventPayload(payload);

    await expect(editor.root.locator('h1')).toHaveCount(2);
    await expect(editor.root.locator('h1').nth(1)).toHaveText('Copied heading');
    await expect(editor.root.locator('p')).toHaveCount(0);
  });

  test('cuts and pastes a fully selected heading as a heading', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop structured cut/paste proof'
    );

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.selectAll();
      await editor.deleteFragment();
      await editor.insertText('Cut heading');
      await page.getByTestId('block-button-heading-one').click();
      await expect(editor.root.locator('h1')).toHaveText('Cut heading');

      await editor.selectAll();
      const payload = await editor.clipboard.cutEventPayload();

      runtimeErrors.assertNone();
      expect(payload.text).toBe('Cut heading');
      expect(payload.pliteFragment).toBeTruthy();
      expect(payload.html).toContain('data-plite-fragment');
      expect(payload.types).toEqual(
        expect.arrayContaining([
          'application/x-plite-fragment',
          'text/html',
          'text/plain',
        ])
      );
      await expect(editor.root.locator('h1')).toHaveCount(0);
      await expect(editor.root.locator('p')).toHaveCount(1);
      await expect.poll(() => editor.get.modelText()).toBe('');

      await editor.clipboard.pasteEventPayload(payload);

      await expect(editor.root.locator('h1')).toHaveText('Cut heading');
      await editor.assert.blockTexts(['Cut heading']);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('handles empty block quote Enter behavior from the browser', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selectAll();
    await editor.deleteFragment();
    await page.getByTestId('block-button-block-quote').click();
    await expect(editor.root.locator('blockquote')).toHaveCount(1);

    await editor.press('Enter');

    await expect(editor.root.locator('blockquote')).toHaveCount(1);
    await expect(editor.root.locator('p')).toHaveCount(1);
  });

  test('applies toolbar bold to the browser-selected text', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });
      await page.getByTestId('mark-button-bold').click();
      await expect(
        editor.root.locator('strong').filter({ hasText: 'This' })
      ).toHaveCount(1);

      await editor.root.dispatchEvent('mousedown');
      await editor.selection.selectDOM({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 5 },
      });
      await expect
        .poll(() => editor.selection.location())
        .toMatchObject({
          anchorOffset: 0,
          anchorPath: [1, 0],
          isCollapsed: false,
        });

      await page.getByTestId('mark-button-bold').click();

      runtimeErrors.assertNone();
      await expect(
        editor.root.locator('strong').filter({ hasText: 'This' })
      ).toHaveCount(1);
      await expect(
        editor.root.locator('strong').filter({ hasText: 'Since' })
      ).toHaveCount(1);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 5 },
        });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps selected word expanded after toggling toolbar bold off', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.root.dispatchEvent('mousedown');
      await editor.selection.selectDOM({
        anchor: { path: [0, 0], offset: 8 },
        focus: { path: [0, 0], offset: 16 },
      });
      await expectEditableWordSelected(editor.root);
      await editor.assert.focusOwner('editor');

      await page.getByTestId('mark-button-bold').click();
      await expectEditableWordSelected(editor.root);
      await editor.assert.focusOwner('editor');

      const boldSelection = await editor.selection.get();
      expect(boldSelection).not.toBeNull();
      expect(boldSelection?.anchor).not.toEqual(boldSelection?.focus);

      await page.getByTestId('mark-button-bold').click();

      runtimeErrors.assertNone();
      await expectEditableWordSelected(editor.root);
      await editor.assert.focusOwner('editor');

      const unboldSelection = await editor.selection.get();
      expect(unboldSelection).not.toBeNull();
      expect(unboldSelection?.anchor).not.toEqual(unboldSelection?.focus);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps warm toolbar mark selection usable through arrows without reload', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop proof');

    test.setTimeout(90_000);

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const result = await editor.scenario.run(
      'richtext-warm-toolbar-mark-arrow-conformance',
      createPliteBrowserWarmToolbarArrowGauntlet({
        domCaretAfterInsert: {
          offset: 9,
          text: 'editableW',
        },
        insertedText: 'W',
        markDOMSelection: {
          anchorNodeText: 'This is editable ',
          anchorOffset: 8,
          focusNodeText: 'This is editable ',
          focusOffset: 16,
        },
        markButtonTestId: 'mark-button-bold',
        markSelection: {
          anchor: { path: [0, 0], offset: 8 },
          focus: { path: [0, 0], offset: 16 },
        },
        selectedText: 'editable',
        selectionAfterArrowLeft: {
          anchor: { path: [0, 1], offset: 7 },
          focus: { path: [0, 1], offset: 7 },
        },
        selectionAfterCollapse: {
          anchor: { path: [0, 1], offset: 8 },
          focus: { path: [0, 1], offset: 8 },
        },
        selectionAfterInsert: {
          anchor: { path: [0, 1], offset: 9 },
          focus: { path: [0, 1], offset: 9 },
        },
        textAfterInsert:
          'This is editableW rich text, much better than a <textarea>!',
        warmIterationOverrides: [
          {},
          {
            markDOMSelection: {
              anchorNodeText: 'editable',
              anchorOffset: 0,
              focusNodeText: 'editable',
              focusOffset: 8,
            },
            markSelection: {
              anchor: { path: [0, 1], offset: 0 },
              focus: { path: [0, 1], offset: 8 },
            },
            selectionAfterArrowLeft: {
              anchor: { path: [0, 1], offset: 7 },
              focus: { path: [0, 1], offset: 7 },
            },
            selectionAfterCollapse: {
              anchor: { path: [0, 1], offset: 8 },
              focus: { path: [0, 1], offset: 8 },
            },
          },
        ],
        warmIterations: 2,
      }),
      {
        metadata: {
          capabilities: [
            'caret',
            'dom-selection',
            'generated-gauntlet',
            'kernel-trace',
            'no-refresh',
            'toolbar-command',
            'warm-state',
          ],
          platform: testInfo.project.name,
          transport: 'native-click-and-keyboard',
        },
        tracePath: testInfo.outputPath(
          'richtext-warm-toolbar-mark-arrow-conformance.json'
        ),
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.replay.replayable).toBe(true);
    expect(result.trace.map((entry) => entry.label)).toEqual(
      expect.arrayContaining(['warm-select-word-2'])
    );
    expect(result.reductionCandidates.length).toBeGreaterThan(0);
    expect(result.reductionCandidates[0]?.stepLabels).toContain(
      'activate-editor-before-warm-selection'
    );
    expect(result.reductionCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'iteration',
          label: 'warm-toolbar-arrow:iteration:2',
        }),
      ])
    );
    const secondIterationCandidate = result.reductionCandidates.find(
      (candidate) => candidate.label === 'warm-toolbar-arrow:iteration:2'
    );

    expect(secondIterationCandidate?.replay.replayable).toBe(true);
    expect(secondIterationCandidate?.removedStepSummaries).toEqual(
      expect.arrayContaining([
        expect.stringContaining('warm-select-word-2: selectDOM'),
      ])
    );
    expect(secondIterationCandidate?.stepSummaries).toEqual(
      expect.arrayContaining([
        expect.stringContaining('warm-select-word-1: selectDOM'),
      ])
    );
    expect(secondIterationCandidate?.replay.steps).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'clickTestId',
          label: 'warm-bold-on-1',
          summary: 'warm-bold-on-1: clickTestId mark-button-bold',
          value: expect.objectContaining({
            kind: 'clickTestId',
            testId: 'mark-button-bold',
          }),
        }),
        expect.objectContaining({
          kind: 'assertSelectedText',
          label: 'assert-selection-expanded-after-bold-off-1',
          value: expect.objectContaining({
            kind: 'assertSelectedText',
            text: 'editable',
          }),
        }),
      ])
    );
    const kernelTrace = result.trace.flatMap(
      (entry) => entry.snapshot.kernelTrace
    );

    expect(kernelTrace).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventFamily: 'keydown',
          frame: expect.objectContaining({ eventFamily: 'keydown' }),
          frameId: expect.any(Number),
          movement: expect.objectContaining({
            axis: 'horizontal',
            ownership: 'model-owned',
            reason: 'model-horizontal-inline-void',
          }),
        }),
        expect.objectContaining({
          eventFamily: 'repair',
          frameId: expect.any(Number),
          selectionChangeOrigin: 'repair-induced',
        }),
      ])
    );
    await expect
      .poll(() =>
        editor.root.evaluate((root) => {
          const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
          let count = 0;
          let node = walker.nextNode();

          while (node) {
            if (node.textContent === 'editableW') {
              count++;
            }
            node = walker.nextNode();
          }

          return count;
        })
      )
      .toBe(1);
  });

  test('applies toolbar alignment from browser target even when model selection already has alignment', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });
      await page.getByTestId('block-button-center').click();
      await expect(page.locator('[data-plite-editor] p').first()).toHaveCSS(
        'text-align',
        'center'
      );

      await editor.root.dispatchEvent('mousedown');
      await editor.selection.selectDOM({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      await page.getByTestId('block-button-center').click();

      runtimeErrors.assertNone();
      await expect(page.locator('[data-plite-editor] p').first()).toHaveCSS(
        'text-align',
        'center'
      );
      await expect(page.locator('[data-plite-editor] p').nth(1)).toHaveCSS(
        'text-align',
        'center'
      );
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('applies toolbar list from browser target even when model selection already has list', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      });
      await page.getByTestId('block-button-bulleted-list').click();
      await expect(
        page
          .locator('[data-plite-editor] ul')
          .filter({ hasText: 'This is editable rich text' })
      ).toHaveCount(1);

      await editor.root.dispatchEvent('mousedown');
      await editor.selection.selectDOM({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });

      await page.getByTestId('block-button-bulleted-list').click();

      runtimeErrors.assertNone();
      await expect(
        page
          .locator('[data-plite-editor] ul')
          .filter({ hasText: 'This is editable rich text' })
      ).toHaveCount(1);
      await expect(
        page
          .locator('[data-plite-editor] ul')
          .filter({ hasText: "Since it's rich text" })
      ).toHaveCount(1);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0, 0], offset: 0 },
          focus: { path: [1, 0, 0], offset: 0 },
        });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('deletes an expanded selection across toolbar list items cleanly', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop proof');

    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const root = page.locator('[data-plite-editor]');
    const secondPrefixText =
      "Since it's rich text, you can do things like turn a selection of text ";
    const secondTailText =
      ', or add a semantically rendered block quote in the middle of the page, like this:';

    try {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: secondPrefixText.length },
      });
      await page.getByTestId('block-button-bulleted-list').click();
      await expect(root.locator('ul > li')).toHaveCount(2);

      await editor.selection.select({
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 2], offset: secondTailText.length },
      });
      await editor.root.press('Backspace');

      runtimeErrors.assertNone();
      await expect(root.locator('ul')).toHaveCount(0);
      await expect(root.locator('blockquote')).toHaveText('A wise quote.');
      await editor.type('after');
      await expect.poll(() => editor.get.modelText()).toContain('after');
      await expect(root.locator('ul')).toHaveCount(0);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('applies toolbar list only to the fully selected paragraph', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const root = page.locator('[data-plite-editor]');
    const firstText =
      'This is editable rich text, much better than a <textarea>!';
    const secondText = "Since it's rich text";

    try {
      await editor.selection.selectDOM({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 6], offset: 1 },
      });

      await page.getByTestId('block-button-numbered-list').click();

      runtimeErrors.assertNone();
      await expect(root.locator('ol > li')).toHaveCount(1);
      await expect(root.locator('ol > li').first()).toContainText(firstText);
      await expect(
        root.locator('p').filter({ hasText: secondText })
      ).toHaveCount(1);
      await expect(
        root.locator('ol').filter({ hasText: secondText })
      ).toHaveCount(0);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('toggles toolbar lists off and converts between list types', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const root = page.locator('[data-plite-editor]');

    try {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 5 },
      });

      await page.getByTestId('block-button-bulleted-list').click();
      await expect(root.locator('ul > li')).toHaveCount(2);
      await expect(root.locator('ul > li').nth(0)).toContainText(
        'This is editable rich text'
      );
      await expect(root.locator('ul > li').nth(1)).toContainText(
        "Since it's rich text"
      );

      await page.getByTestId('block-button-bulleted-list').click();
      await expect(root.locator('ul')).toHaveCount(0);
      await expect(
        root.locator('p').filter({ hasText: 'This is editable rich text' })
      ).toHaveCount(1);
      await expect(
        root.locator('p').filter({ hasText: "Since it's rich text" })
      ).toHaveCount(1);

      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [1, 0], offset: 5 },
      });

      await page.getByTestId('block-button-numbered-list').click();
      await expect(root.locator('ol > li')).toHaveCount(2);
      await expect(root.locator('ul')).toHaveCount(0);

      await page.getByTestId('block-button-bulleted-list').click();
      await expect(root.locator('ul > li')).toHaveCount(2);
      await expect(root.locator('ol')).toHaveCount(0);

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('toggles an empty paragraph into and out of a toolbar list', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const root = page.locator('[data-plite-editor]');

    try {
      await editor.selection.selectAll();
      await page.keyboard.press('Backspace');
      await expect(root.locator('p')).toHaveCount(1);
      await expect.poll(() => editor.get.modelText()).toBe('');
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });

      await page.getByTestId('block-button-bulleted-list').click();
      await expect(root.locator('ul > li')).toHaveCount(1);
      await expect(root.locator('p')).toHaveCount(0);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [0, 0, 0], offset: 0 },
          focus: { path: [0, 0, 0], offset: 0 },
        });

      await page.getByTestId('block-button-bulleted-list').click();
      await expect(root.locator('ul')).toHaveCount(0);
      await expect(root.locator('p')).toHaveCount(1);
      await expect.poll(() => editor.get.modelText()).toBe('');
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        });

      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('records core command metadata for text input and delete', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const mobile = testInfo.project.name === 'mobile';

    const result = await editor.scenario.run(
      'text-input-delete-command-metadata',
      [
        {
          kind: 'select',
          label: 'select-text-input-start',
          selection: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 4 },
          },
        },
        mobile
          ? {
              kind: 'insertText' as const,
              label: 'semantic-text-input',
              text: 'Q',
            }
          : {
              kind: 'type' as const,
              label: 'native-text-input',
              text: 'Q',
            },
        {
          kind: 'assertSelection',
          label: 'assert-selection-after-text-input',
          selection: {
            anchor: { path: [0, 0], offset: 5 },
            focus: { path: [0, 0], offset: 5 },
          },
        },
        ...(mobile
          ? []
          : [
              {
                kind: 'assertDOMCaret' as const,
                label: 'assert-caret-after-native-text-input',
                offset: 5,
                text: 'ThisQ is editable ',
              },
            ]),
        {
          kind: 'assertModelText',
          label: 'assert-model-text-after-text-input',
          text: 'ThisQ is editable rich text',
        },
        {
          kind: 'assertText',
          label: 'assert-dom-text-after-text-input',
          text: 'ThisQ is editable rich text',
        },
        {
          command: {
            origin: 'command',
            type: 'insert_text',
          },
          kind: 'assertLastCommitCommand',
          label: 'assert-commit-after-text-input',
        },
        mobile
          ? {
              kind: 'deleteBackward' as const,
              label: 'semantic-backspace',
            }
          : {
              key: 'Backspace',
              kind: 'press' as const,
              label: 'native-backspace',
            },
        {
          kind: 'assertSelection',
          label: 'assert-selection-after-backspace',
          selection: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 4 },
          },
        },
        ...(mobile
          ? []
          : [
              {
                kind: 'assertDOMCaret' as const,
                label: 'assert-caret-after-native-backspace',
                offset: 4,
                text: 'This is editable ',
              },
            ]),
        {
          kind: 'assertModelText',
          label: 'assert-model-text-after-backspace',
          text: 'This is editable rich text',
        },
        {
          kind: 'assertText',
          label: 'assert-dom-text-after-backspace',
          text: 'This is editable rich text',
        },
        {
          command: {
            origin: 'command',
            type: 'delete',
          },
          kind: 'assertLastCommitCommand',
          label: 'assert-commit-after-backspace',
        },
      ],
      {
        metadata: {
          capabilities: [
            'core-command-metadata',
            'dom-selection',
            'model-selection',
            'text-mutation',
          ],
          platform: testInfo.project.name,
          transport: mobile ? 'semantic-handle' : 'native-keyboard',
        },
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.replay.replayable).toBe(true);
  });

  test('records selectionchange and repair kernel results', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const mobile = testInfo.project.name === 'mobile';

    const result = await editor.scenario.run(
      'selectionchange-repair-kernel-results',
      [
        {
          kind: 'rootClick',
          label: 'selectionchange-trace',
        },
        {
          kind: 'assertKernelTrace',
          label: 'assert-selectionchange-trace',
          trace: {
            eventFamily: 'selectionchange',
            transition: { allowed: true },
          },
        },
        {
          kind: 'select',
          label: 'select-text-repair-start',
          selection: {
            anchor: { path: [0, 0], offset: 4 },
            focus: { path: [0, 0], offset: 4 },
          },
        },
        mobile
          ? {
              kind: 'insertText' as const,
              label: 'semantic-text-repair',
              text: 'R',
            }
          : {
              kind: 'type' as const,
              label: 'native-text-repair',
              text: 'R',
            },
        {
          kind: 'assertSelection',
          label: 'assert-selection-after-text-repair',
          selection: {
            anchor: { path: [0, 0], offset: 5 },
            focus: { path: [0, 0], offset: 5 },
          },
        },
        ...(mobile
          ? []
          : [
              {
                kind: 'assertDOMCaret' as const,
                label: 'assert-caret-after-native-text-repair',
                offset: 5,
                text: 'ThisR is editable ',
              },
            ]),
        {
          kind: 'assertModelText',
          label: 'assert-model-text-after-text-repair',
          text: 'ThisR is editable rich text',
        },
        {
          kind: 'assertText',
          label: 'assert-dom-text-after-text-repair',
          text: 'ThisR is editable rich text',
        },
        {
          kind: 'assertKernelTrace',
          label: 'assert-repair-trace',
          trace: {
            eventFamily: 'repair',
            transition: { allowed: true },
          },
        },
      ],
      {
        metadata: {
          capabilities: [
            'dom-selection',
            'kernel-repair',
            'model-selection',
            'text-mutation',
          ],
          platform: testInfo.project.name,
          transport: mobile ? 'semantic-handle' : 'native-keyboard',
        },
      }
    );

    assertNoIllegalKernelTransitions(result);
    expect(result.replay.replayable).toBe(true);
  });

  test('imports programmatic DOM selection through explicit browser handle', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.root.click();
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });

    await editor.selection.importDOM();

    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });

    const importTrace = [...(await editor.get.kernelTrace())].reverse().find(
      (entry) =>
        (
          entry as {
            eventFamily?: string;
            selectionPolicy?: { kind?: string };
          }
        ).eventFamily === 'selectionchange' &&
        (
          entry as {
            selectionPolicy?: { kind?: string };
          }
        ).selectionPolicy?.kind === 'import-dom'
    ) as
      | {
          selectionAfter?: unknown;
          selectionPolicy?: unknown;
          transition?: unknown;
        }
      | undefined;

    expect(importTrace?.selectionAfter).toEqual({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });
    expect(importTrace?.selectionPolicy).toMatchObject({
      kind: 'import-dom',
    });
    expect(['native-selection', 'unknown-selection']).toContain(
      (
        importTrace?.selectionPolicy as
          | {
              reason?: string;
            }
          | undefined
      )?.reason
    );
    expect(importTrace?.transition).toEqual({
      allowed: true,
      reason: null,
    });
  });

  test('records repair trace with observable DOM and model selection', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    });
    await editor.page.keyboard.type('R');

    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    await editor.assert.domSelection({
      anchorNodeText: 'ThisR is editable ',
      anchorOffset: 5,
      focusNodeText: 'ThisR is editable ',
      focusOffset: 5,
    });

    const repairTrace = [...(await editor.get.kernelTrace())].reverse().find(
      (entry) =>
        (
          entry as {
            eventFamily?: string;
            repairPolicy?: { kind?: string };
          }
        ).eventFamily === 'repair' &&
        (
          entry as {
            repairPolicy?: { kind?: string };
          }
        ).repairPolicy?.kind === 'repair-caret'
    ) as
      | {
          repairPolicy?: unknown;
          selectionAfter?: unknown;
          selectionPolicy?: unknown;
        }
      | undefined;

    expect(repairTrace?.selectionAfter).toEqual({
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    expect(repairTrace?.selectionPolicy).toEqual({
      kind: 'preserve-model',
      reason: 'model-owned',
    });
    expect(repairTrace?.repairPolicy).toEqual({
      kind: 'repair-caret',
      reason: 'repair-caret-after-text-insert',
    });
  });

  test('keeps selection synchronized after browser word movement', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop word-movement proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await editor.selection.select({
      anchor: { path: [0, 4], offset: 4 },
      focus: { path: [0, 4], offset: 4 },
    });

    await page.keyboard.press('Control+ArrowLeft');

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 4], offset: 1 },
        focus: { path: [0, 4], offset: 1 },
      });
    await expect
      .poll(() =>
        editor.root.evaluate((element: HTMLElement) => {
          const selection = element.ownerDocument.getSelection();

          return Boolean(
            selection?.isCollapsed &&
              selection.anchorNode &&
              selection.focusNode &&
              element.contains(selection.anchorNode) &&
              element.contains(selection.focusNode)
          );
        })
      )
      .toBe(true);
    await expect
      .poll(() => editor.get.kernelTrace())
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            command: expect.objectContaining({
              axis: 'word',
              kind: 'move-selection',
            }),
            eventFamily: 'keydown',
            movement: expect.objectContaining({
              axis: 'word',
              ownership: 'model-owned',
              reason: 'model-word-boundary',
            }),
          }),
        ])
      );

    await page.keyboard.press('Control+ArrowRight');

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 4], offset: 7 },
        focus: { path: [0, 4], offset: 7 },
      });
    await expect
      .poll(() =>
        editor.root.evaluate((element: HTMLElement) => {
          const selection = element.ownerDocument.getSelection();

          return Boolean(
            selection?.isCollapsed &&
              selection.anchorNode &&
              selection.focusNode &&
              element.contains(selection.anchorNode) &&
              element.contains(selection.focusNode)
          );
        })
      )
      .toBe(true);
    await expect
      .poll(() => editor.get.kernelTrace())
      .toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            command: expect.objectContaining({
              axis: 'word',
              kind: 'move-selection',
            }),
            eventFamily: 'keydown',
            movement: expect.objectContaining({
              axis: 'word',
              ownership: 'model-owned',
              reason: 'model-word-boundary',
            }),
          }),
        ])
      );
  });

  test('keeps selection synchronized after browser line extension', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL,
      userAgent: macChromeUserAgent,
    });
    const page = await context.newPage();

    try {
      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.click();
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });

      await page.keyboard.press('Alt+Shift+ArrowDown');

      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 6], offset: 1 },
        });
      await expect
        .poll(() =>
          editor.root.evaluate((element: HTMLElement) => {
            const selection = element.ownerDocument.getSelection();

            return Boolean(
              selection &&
                !selection.isCollapsed &&
                selection.anchorNode &&
                selection.focusNode &&
                element.contains(selection.anchorNode) &&
                element.contains(selection.focusNode)
            );
          })
        )
        .toBe(true);
      await expect
        .poll(() => editor.get.kernelTrace())
        .toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              command: expect.objectContaining({
                axis: 'line',
                extend: true,
                kind: 'move-selection',
              }),
              eventFamily: 'keydown',
              movement: expect.objectContaining({
                axis: 'line',
                extend: true,
                ownership: 'model-owned',
                reason: 'model-line-browser',
              }),
            }),
          ])
        );
    } finally {
      await context.close();
    }
  });

  test('selects the current block on browser triple click', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop browser triple-click proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await page
      .locator('[data-plite-editor] p')
      .first()
      .click({ clickCount: 3 });

    const firstBlockText =
      'This is editable rich text, much better than a <textarea>!';

    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 6], offset: 1 },
      });
    await expect
      .poll(async () =>
        (await editor.get.selectedText()).replaceAll('\u00A0', ' ')
      )
      .toBe(firstBlockText);
    await expect(page.getByTestId('block-button-block-quote')).not.toHaveClass(
      /is-active/
    );
    await expect
      .poll(() =>
        editor.root.evaluate((element: HTMLElement) => {
          const selection = element.ownerDocument.getSelection();

          return Boolean(
            selection &&
              !selection.isCollapsed &&
              selection.anchorNode &&
              selection.focusNode &&
              element.contains(selection.anchorNode) &&
              element.contains(selection.focusNode)
          );
        })
      )
      .toBe(true);
  });

  test('removes the current block after browser triple click and Backspace', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop browser triple-click proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const firstBlockText =
      'This is editable rich text, much better than a <textarea>!';
    const nextBlockText =
      "Since it's rich text, you can do things like turn a selection of text bold, or add a semantically rendered block quote in the middle of the page, like this:";

    await editor.click();
    await page
      .locator('[data-plite-editor] p')
      .first()
      .click({ clickCount: 3 });

    await page.keyboard.press('Backspace');

    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe(nextBlockText);
    await expect(editor.root).not.toContainText(firstBlockText);

    await page.keyboard.insertText('Z');

    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe(`Z${nextBlockText}`);
    await editor.assert.domCaret({
      offset: 1,
      text: "ZSince it's rich text, you can do things like turn a selection of text ",
    });
  });

  test('replaces the current block after browser triple click and typing', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop browser triple-click proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const nextBlockText =
      "Since it's rich text, you can do things like turn a selection of text bold, or add a semantically rendered block quote in the middle of the page, like this:";

    await editor.click();
    await page
      .locator('[data-plite-editor] p')
      .first()
      .click({ clickCount: 3 });

    await page.keyboard.type('Z');

    await expect
      .poll(async () => (await editor.get.blockTexts()).slice(0, 2))
      .toEqual(['Z', nextBlockText]);
    await editor.assert.domCaret({
      offset: 1,
      text: 'Z',
    });
  });

  test('preserves the selected heading block after browser text replacement', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      browserName === 'firefox' || testInfo.project.name === 'mobile',
      'Non-Firefox desktop proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const runtimeErrors = recordPliteBrowserRuntimeErrors(page);

    try {
      await editor.selectAll();
      await editor.deleteFragment();
      await editor.insertText('Heading');
      await page.getByTestId('block-button-heading-one').click();

      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 'Heading'.length },
      });
      await page.keyboard.insertText('Z');

      runtimeErrors.assertNone();
      await expect(editor.root.locator('h1')).toHaveText('Z');
      await expect(editor.root.locator('p')).toHaveCount(0);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 1 },
      });
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps the visual caret after browser insertion at the selected text end', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      browserName === 'firefox' || testInfo.project.name === 'mobile',
      'Non-Firefox desktop proof'
    );

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await selectEndOfFirstBlockWithDOMSelection(editor.root);
    await page.keyboard.insertText('O');

    await editor.assert.text(
      'This is editable rich text, much better than a <textarea>!O'
    );
    await expect
      .poll(() => editor.get.modelText())
      .toContain('This is editable rich text, much better than a <textarea>!O');
    await expectDOMCaretAtTextEnd(editor.root, '!O');
    await expectVisualCaretAtEndOfFirstBlock(editor.root);
  });

  test('places a right-margin click at the multi-leaf text end', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop pointer proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await page.setViewportSize({ height: 720, width: 1100 });
    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    const point = await getFirstParagraphRightMarginClickPoint(editor.root);
    await page.mouse.click(point.x, point.y);

    await editor.assert.selection({
      anchor: { path: [0, 6], offset: 1 },
      focus: { path: [0, 6], offset: 1 },
    });
    await editor.assert.domCaret({
      offset: 1,
      text: '!',
    });

    await page.keyboard.insertText('O');

    await editor.assert.text(
      'This is editable rich text, much better than a <textarea>!O'
    );
    await expect
      .poll(() => editor.get.modelText())
      .toContain('This is editable rich text, much better than a <textarea>!O');
    await expectDOMCaretAtTextEnd(editor.root, '!O');
    await expectVisualCaretAtEndOfFirstBlock(editor.root);
  });

  test('keeps the visual caret after browser insertion before trailing punctuation', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop text input proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await editor.selection.select({
      anchor: { path: [0, 6], offset: 0 },
      focus: { path: [0, 6], offset: 0 },
    });
    await page.keyboard.insertText('O');

    await editor.assert.text(
      'This is editable rich text, much better than a <textarea>O!'
    );
    await expect
      .poll(() => editor.get.modelText())
      .toContain('This is editable rich text, much better than a <textarea>O!');
    await expectDOMCaretAfterInsertedTextBeforeSuffix(editor.root, 'O', '!');
  });

  test('keeps the visual caret after browser insertion inside a text leaf', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop text input proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await editor.selection.select({
      anchor: { path: [0, 2], offset: 1 },
      focus: { path: [0, 2], offset: 1 },
    });
    await page.keyboard.insertText('O');

    await editor.assert.text(
      'This is editable rich Otext, much better than a <textarea>!'
    );
    await expect
      .poll(() => editor.get.modelText())
      .toContain('This is editable rich Otext, much better than a <textarea>!');
    await expectDOMCaretBetweenText(editor.root, ' O', 'text, ');
  });

  test('undoes inserted text', async ({ browserName, page }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    if (browserName === 'firefox' || testInfo.project.name === 'mobile') {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
      await editor.insertText('Undo Me');
    } else {
      await editor.click();
      await editor.root.press('Home');
      await page.keyboard.insertText('Undo Me');
    }

    await editor.assert.text('Undo Me');
    await expect.poll(() => editor.get.modelText()).toContain('Undo Me');

    if (browserName === 'firefox' || testInfo.project.name === 'mobile') {
      await editor.undo();
    } else {
      await page.keyboard.press(await getBrowserUndoHotkey(editor.root));
    }

    await expect(editor.root).not.toContainText('Undo Me');
    await expect.poll(() => editor.get.modelText()).not.toContain('Undo Me');
  });

  test('applies native beforeinput history undo and redo', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop beforeinput proof');

    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const dispatchHistoryBeforeInput = async (
      inputType: 'historyRedo' | 'historyUndo'
    ) =>
      editor.root.evaluate((element: HTMLElement, type) => {
        const event = new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: type,
        });
        const dispatched = element.dispatchEvent(event);

        return {
          defaultPrevented: event.defaultPrevented,
          dispatched,
        };
      }, inputType);

    await editor.click();
    await editor.root.press('Home');
    await page.keyboard.insertText('Undo Me ');

    await editor.assert.text('Undo Me');
    await expect.poll(() => editor.get.modelText()).toContain('Undo Me');

    await expect
      .poll(async () => dispatchHistoryBeforeInput('historyUndo'))
      .toEqual({
        defaultPrevented: true,
        dispatched: false,
      });
    await expect(editor.root).not.toContainText('Undo Me');
    await expect.poll(() => editor.get.modelText()).not.toContain('Undo Me');
    await expect
      .poll(async () =>
        (await editor.get.kernelTrace()).some(
          (entry) =>
            entry.eventFamily === 'beforeinput' &&
            entry.command?.kind === 'history' &&
            entry.command.direction === 'undo'
        )
      )
      .toBe(true);

    await expect
      .poll(async () => dispatchHistoryBeforeInput('historyRedo'))
      .toEqual({
        defaultPrevented: true,
        dispatched: false,
      });
    await editor.assert.text('Undo Me');
    await expect.poll(() => editor.get.modelText()).toContain('Undo Me');
    await expect
      .poll(async () =>
        (await editor.get.kernelTrace()).some(
          (entry) =>
            entry.eventFamily === 'beforeinput' &&
            entry.command?.kind === 'history' &&
            entry.command.direction === 'redo'
        )
      )
      .toBe(true);
  });

  test('repairs DOM after Mac keyboard undo', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL,
      userAgent: macChromeUserAgent,
    });
    const page = await context.newPage();

    try {
      const editor = await openExample(page, 'plite/richtext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.click();
      await expect(editor.root).toBeFocused();
      await editor.root.press('Home');
      await expect(editor.root).toBeFocused();
      await page.keyboard.type('Undo Me');

      await editor.assert.text('Undo Me');
      await expect.poll(() => editor.get.modelText()).toContain('Undo Me');

      await page.keyboard.press('Meta+Z');

      await expect.poll(() => editor.get.modelText()).not.toContain('Undo Me');
      await expect(editor.root).not.toContainText('Undo Me');
    } finally {
      await context.close();
    }
  });

  test('undo restores deleted selected text', async ({ page }) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.assert.text('This is editable rich text');
    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 'This is editable '.length },
    });
    await editor.deleteFragment();
    await expect(editor.root).not.toContainText('This is editable rich text');

    await editor.undo();
    await editor.assert.text('This is editable rich text');
  });

  test('keeps caret editable after plain text paste over selected range', async ({
    page,
  }, testInfo) => {
    const editor = await openExample(page, 'plite/richtext', {
      ready: {
        editor: 'visible',
      },
    });
    const afterPasteText =
      'Paste is editable rich text, much better than a <textarea>!';
    const afterTypingText =
      'Paste! is editable rich text, much better than a <textarea>!';

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });

    if (testInfo.project.name === 'mobile') {
      await editor.insertText('Paste');
    } else {
      await editor.clipboard.pasteText('Paste');
    }

    await editor.assert.text(afterPasteText);
    if (testInfo.project.name === 'mobile') {
      await editor.selection.select({
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      });
    } else {
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 5 },
        focus: { path: [0, 0], offset: 5 },
      });
      await editor.assert.domSelection({
        anchorNodeText: 'Paste is editable ',
        anchorOffset: 5,
        focusNodeText: 'Paste is editable ',
        focusOffset: 5,
      });
    }

    if (testInfo.project.name === 'mobile') {
      await editor.insertText('!');
    } else {
      await editor.type('!');
    }

    await editor.assert.text(afterTypingText);
    if (testInfo.project.name !== 'mobile') {
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 6 },
        focus: { path: [0, 0], offset: 6 },
      });
      await editor.assert.domSelection({
        anchorNodeText: 'Paste! is editable ',
        anchorOffset: 6,
        focusNodeText: 'Paste! is editable ',
        focusOffset: 6,
      });
    }
  });

  test('does not duplicate native input handling after route remount', async ({
    page,
  }, testInfo) => {
    const typeText = async (
      editor: Awaited<ReturnType<typeof openExample>>,
      text: string
    ) => {
      if (testInfo.project.name === 'mobile') {
        await editor.insertText(text);
        return;
      }

      await editor.type(text);
    };

    const editor = await openExample(page, 'plite/richtext', {
      ready: { editor: 'visible' },
    });

    await editor.selection.collapse({ path: [0, 6], offset: 1 });
    await typeText(editor, 'A');
    await editor.assert.text(
      'This is editable rich text, much better than a <textarea>!A'
    );

    await page.goto('/examples/plite/plaintext');

    const remountedEditor = await openExample(page, 'plite/richtext', {
      ready: { editor: 'visible' },
    });

    await remountedEditor.selection.collapse({ path: [0, 6], offset: 1 });
    await typeText(remountedEditor, 'B');
    await remountedEditor.assert.text(
      'This is editable rich text, much better than a <textarea>!B'
    );
  });
});
