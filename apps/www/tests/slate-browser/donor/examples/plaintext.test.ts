import { expect, type Locator, test } from '@playwright/test';
import {
  assertSlateBrowserSelectionContract,
  openExample,
  recordSlateBrowserRuntimeErrors,
  startSlateBrowserNativeEventTrace,
  stopSlateBrowserNativeEventTrace,
  takeSlateBrowserNativeEventTrace,
} from '@platejs/browser/playwright';

const getBrowserUndoHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta+Z' : 'Control+Z'
    );

const getBrowserLineEndHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent) ? 'Meta+ArrowRight' : 'End'
    );

const getBrowserWordForwardHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
        ? 'Alt+ArrowRight'
        : 'Control+ArrowRight'
    );

const getBrowserWordBackwardHotkey = async (root: Locator) =>
  root
    .page()
    .evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
        ? 'Alt+ArrowLeft'
        : 'Control+ArrowLeft'
    );

const isMacBrowser = async (root: Locator) =>
  root.page().evaluate(() => /Mac OS X/.test(navigator.userAgent));

test.describe('plaintext example', () => {
  test.beforeEach(
    async ({ page }) => await page.goto('/examples/slate/plaintext')
  );

  test('inserts text when typed', async ({ page }) => {
    const insertedText = ' Hello World';
    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.click();
    await editor.press('End');
    await page.keyboard.type(insertedText);

    await expect(editor.root).toContainText(insertedText);
    await expect.poll(() => editor.get.text()).toContain(insertedText);
  });

  test('captures native beforeinput trace while inserting text', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native input proof');

    const insertedText = ' trace';
    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);
    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    try {
      await editor.click();
      await editor.press('End');
      await startSlateBrowserNativeEventTrace(editor.root, {
        events: ['beforeinput', 'input'],
      });
      await page.keyboard.insertText(insertedText);

      await expect.poll(() => editor.get.text()).toContain(insertedText);

      const trace = await takeSlateBrowserNativeEventTrace(editor.root);
      const beforeinput = trace.entries.find(
        (entry) => entry.type === 'beforeinput'
      );
      const inputEntries = trace.entries.filter(
        (entry) => entry.type === 'input'
      );
      const expectedInputType =
        testInfo.project.name === 'firefox'
          ? 'insertCompositionText'
          : 'insertText';

      expect(trace.anomalies).toEqual([]);
      expect(trace.entries.at(0)?.type).toBe('beforeinput');
      expect(beforeinput).toMatchObject({
        data: insertedText,
        inputType: expectedInputType,
      });
      expect(beforeinput?.selection.selectedText).toBe('');
      if (testInfo.project.name === 'firefox') {
        expect(inputEntries).toHaveLength(1);
        expect(inputEntries[0]).toMatchObject({
          data: insertedText,
          inputType: expectedInputType,
        });
      } else {
        expect(inputEntries).toEqual([]);
      }
      runtimeErrors.assertNone();
    } finally {
      await stopSlateBrowserNativeEventTrace(editor.root).catch(() => {});
      runtimeErrors.stop();
    }
  });

  test('clicking inside selected text collapses the selection', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop pointer proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 'This is '.length },
      focus: { path: [0, 0], offset: 'This is editable'.length },
    });
    await expect.poll(() => editor.get.selectedText()).toBe('editable');

    const point = await editor.root.evaluate((element: HTMLElement) => {
      const text = element.textContent ?? '';
      const offset = text.indexOf('editable') + 'edit'.length;
      const walker = element.ownerDocument.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
      );
      let remaining = offset;
      let textNode: Text | null = null;

      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        const length = node.textContent?.length ?? 0;

        if (remaining <= length) {
          textNode = node;
          break;
        }

        remaining -= length;
      }

      if (!textNode) {
        throw new Error('Missing selected text node');
      }

      const range = element.ownerDocument.createRange();
      range.setStart(textNode, remaining);
      range.collapse(true);
      const rect = range.getBoundingClientRect();

      return {
        x: rect.left,
        y: rect.top + rect.height / 2,
      };
    });

    await page.mouse.click(point.x, point.y);
    await expect.poll(() => editor.get.selectedText()).toBe('');
    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        return selection
          ? JSON.stringify(selection.anchor) === JSON.stringify(selection.focus)
          : false;
      })
      .toBe(true);
  });

  test('Shift+click extends a collapsed text selection', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop modifier/click proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });
      const anchorOffset = 'This is '.length;
      const focusOffset = 'This is editable plain'.length;
      const selectedText = 'editable plain';

      await editor.selection.collapse({ path: [0, 0], offset: anchorOffset });
      await page.keyboard.down('Shift');
      await editor.dom.clickTextOffset({
        offset: focusOffset,
        path: [0, 0],
        waitForSelectionSync: false,
      });
      await page.keyboard.up('Shift');

      await expect.poll(() => editor.get.selectedText()).toBe(selectedText);
      await expect
        .poll(() => page.evaluate(() => window.getSelection()?.toString()))
        .toBe(selectedText);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: anchorOffset },
        focus: { path: [0, 0], offset: focusOffset },
      });
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      await page.keyboard.up('Shift').catch(() => {});
      runtimeErrors.stop();
    }
  });

  test('click selection moves through editable user-select overrides', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop CSS user-select pointer proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });
      const targetOffset = 'This is editable'.length;
      const values =
        testInfo.project.name === 'firefox'
          ? (['auto', 'text'] as const)
          : (['auto', 'text', 'none', 'contain', 'all'] as const);

      if (testInfo.project.name === 'firefox') {
        testInfo.annotations.push({
          description:
            'Firefox keeps CSS user-select override hit testing browser-owned for contenteditable; Chromium/WebKit cover none/contain/all.',
          type: 'proof-width',
        });
      }

      for (const value of values) {
        await editor.root.evaluate(
          (element: HTMLElement, userSelect: string) => {
            element.style.userSelect = userSelect;
          },
          value
        );
        await editor.selection.collapse({ path: [0, 0], offset: 0 });
        await editor.dom.clickTextOffset({
          offset: targetOffset,
          path: [0, 0],
        });

        const expectedSelection = {
          anchor: { path: [0, 0], offset: targetOffset },
          focus: { path: [0, 0], offset: targetOffset },
        };

        await expect
          .poll(() => editor.selection.get())
          .toEqual(expectedSelection);
        await expect
          .poll(() => editor.selection.dom())
          .toEqual({
            anchorNodeText:
              'This is editable plain text, just like a <textarea>!',
            anchorOffset: targetOffset,
            focusNodeText:
              'This is editable plain text, just like a <textarea>!',
            focusOffset: targetOffset,
          });
      }

      await editor.root.evaluate((element: HTMLElement) => {
        element.style.userSelect = '';
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('pastes at the clicked caret after Shift state is released', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop modifier/click proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });
      const initialText = 'alpha beta gamma';
      const selectedText = 'beta';
      const selectionStart = initialText.indexOf(selectedText);
      const selectionEnd = selectionStart + selectedText.length;
      const clickOffset = initialText.indexOf('gamma');
      const pastedText = 'PASTE';

      await editor.selection.selectAll();
      await page.keyboard.insertText(initialText);
      await editor.selection.selectDOM({
        anchor: { path: [0, 0], offset: selectionStart },
        focus: { path: [0, 0], offset: selectionEnd },
      });
      await expect.poll(() => editor.get.selectedText()).toBe(selectedText);

      await page.keyboard.down('Shift');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.up('Shift');
      await editor.root.evaluate((element: HTMLElement) => {
        element.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            code: 'ShiftLeft',
            key: 'Shift',
            shiftKey: true,
          })
        );
      });

      const clickPoint = await editor.root.evaluate(
        (element: HTMLElement, offset: number) => {
          const ownerDocument = element.ownerDocument;
          const walker = ownerDocument.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
          );
          let remaining = offset;

          while (walker.nextNode()) {
            const textNode = walker.currentNode as Text;
            const length = textNode.textContent?.length ?? 0;

            if (remaining <= length) {
              const start = Math.max(0, Math.min(remaining, length - 1));
              const end = Math.min(length, start + 1);
              const range = ownerDocument.createRange();

              range.setStart(textNode, start);
              range.setEnd(textNode, end);

              const rect =
                range.getClientRects()[0] ?? range.getBoundingClientRect();

              if (!rect || rect.width <= 0 || rect.height <= 0) {
                throw new Error('Missing click target text rect');
              }

              return {
                x: rect.left + 1,
                y: rect.top + rect.height / 2,
              };
            }

            remaining -= length;
          }

          throw new Error('Missing click target text node');
        },
        clickOffset
      );

      await page.mouse.click(clickPoint.x, clickPoint.y);
      await expect.poll(() => editor.get.selectedText()).toBe('');
      await expect
        .poll(async () => {
          const selection = await editor.get.selection();

          if (!selection) {
            return false;
          }

          return (
            JSON.stringify(selection.anchor.path) === JSON.stringify([0, 0]) &&
            JSON.stringify(selection.anchor) === JSON.stringify(selection.focus)
          );
        })
        .toBe(true);

      const clickedSelection = await editor.get.selection();
      const insertOffset = clickedSelection?.anchor.offset;

      expect(insertOffset).toBeGreaterThanOrEqual(clickOffset);
      expect(insertOffset).toBeLessThanOrEqual(clickOffset + 1);

      await editor.clipboard.pasteText(pastedText);

      const safeInsertOffset = insertOffset!;
      const expectedText = `${initialText.slice(
        0,
        safeInsertOffset
      )}${pastedText}${initialText.slice(safeInsertOffset)}`;

      await editor.assert.blockTexts([expectedText]);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: safeInsertOffset + pastedText.length },
        focus: { path: [0, 0], offset: safeInsertOffset + pastedText.length },
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('extends a double-click word selection while dragging', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop double-click drag selection proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });
      const text = 'This is editable plain text, just like a <textarea>!';

      await editor.selection.doubleClickDragTextRange({
        doubleClickOffset: 'This is edit'.length,
        endOffset: 'This is editable plain'.length,
        text,
      });

      await expect.poll(() => editor.get.selectedText()).toContain('plain');
      const selectedText = await editor.get.selectedText();
      const nativeSelectedText = await page.evaluate(
        () => window.getSelection()?.toString() ?? ''
      );

      expect(selectedText).not.toBe('editable');
      expect(selectedText.startsWith('editable plain')).toBe(true);
      expect(nativeSelectedText).toBe(selectedText);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 'This is '.length },
        focus: {
          path: [0, 0],
          offset: 'This is '.length + selectedText.length,
        },
      });
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('stays interactive after dragging selected plain text', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop selected-text drag/drop stability proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });
      const initialText =
        'This is editable plain text, just like a <textarea>!';
      const movedText = 'editableThis is  plain text, just like a <textarea>!';
      const selectionStart = 'This is '.length;
      const selectionEnd = selectionStart + 'editable'.length;

      await editor.selection.selectDOM({
        anchor: { path: [0, 0], offset: selectionStart },
        focus: { path: [0, 0], offset: selectionEnd },
      });
      await expect.poll(() => editor.get.selectedText()).toBe('editable');

      const payload = await editor.root.evaluate(
        (
          element: HTMLElement,
          {
            dragOffset,
            dropOffset,
          }: {
            dragOffset: number;
            dropOffset: number;
          }
        ) => {
          const pointForOffset = (offset: number) => {
            const walker = element.ownerDocument.createTreeWalker(
              element,
              NodeFilter.SHOW_TEXT
            );
            let remaining = offset;

            while (walker.nextNode()) {
              const node = walker.currentNode;
              const length = node.textContent?.length ?? 0;

              if (remaining <= length) {
                const range = element.ownerDocument.createRange();

                range.setStart(node, remaining);
                range.collapse(true);

                const rect = range.getBoundingClientRect();

                return {
                  x: rect.left,
                  y: rect.top + rect.height / 2,
                };
              }

              remaining -= length;
            }

            throw new Error('Missing drag/drop text point');
          };
          const dragPoint = pointForOffset(dragOffset);
          const dropPoint = pointForOffset(dropOffset);
          const dragTarget =
            element.ownerDocument.elementFromPoint(dragPoint.x, dragPoint.y) ??
            element;
          const dropTarget =
            element.ownerDocument.elementFromPoint(dropPoint.x, dropPoint.y) ??
            element;
          const data = new DataTransfer();

          dragTarget.dispatchEvent(
            new DragEvent('dragstart', {
              bubbles: true,
              cancelable: true,
              clientX: dragPoint.x,
              clientY: dragPoint.y,
              dataTransfer: data,
            })
          );
          dropTarget.dispatchEvent(
            new DragEvent('dragover', {
              bubbles: true,
              cancelable: true,
              clientX: dropPoint.x,
              clientY: dropPoint.y,
              dataTransfer: data,
            })
          );
          dropTarget.dispatchEvent(
            new DragEvent('drop', {
              bubbles: true,
              cancelable: true,
              clientX: dropPoint.x,
              clientY: dropPoint.y,
              dataTransfer: data,
            })
          );
          dragTarget.dispatchEvent(
            new DragEvent('dragend', {
              bubbles: true,
              cancelable: true,
              clientX: dropPoint.x,
              clientY: dropPoint.y,
              dataTransfer: data,
            })
          );

          return {
            text: data.getData('text/plain'),
            types: [...data.types],
          };
        },
        {
          dragOffset: selectionStart + 1,
          dropOffset: initialText.indexOf('text'),
        }
      );

      expect(payload.types).toContain('application/x-slate-fragment');
      expect(payload.text).toBe('editable');

      await editor.selection.collapse({
        path: [0, 0],
        offset: initialText.length,
      });
      await page.keyboard.type(' still interactive');

      await editor.assert.text(`${movedText} still interactive`);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: movedText.length + 18 },
        focus: { path: [0, 0], offset: movedText.length + 18 },
      });
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('replaces a multi-paragraph selection with typed text', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop selection proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('one');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('two');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('three');
    await editor.assert.blockTexts(['one', 'two', 'three']);

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 'two'.length },
    });
    await page.keyboard.type('replacement');

    await editor.assert.blockTexts(['replacement', 'three']);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'replacement'.length },
      focus: { path: [0, 0], offset: 'replacement'.length },
    });
  });

  test('imports document.execCommand insertText into editor state', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await editor.root.evaluate((element: HTMLElement) => {
      element.focus();
      document.execCommand('insertText', false, 'foo');
    });

    await editor.assert.text('foo');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  test('imports synthetic ClipboardEvent paste data into editor state', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox blocks synthetic ClipboardEvent paste data'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await editor.root.evaluate((element: HTMLElement) => {
      const data = new DataTransfer();
      data.setData('text/plain', 'foo');
      element.dispatchEvent(
        new ClipboardEvent('paste', {
          bubbles: true,
          cancelable: true,
          clipboardData: data,
        })
      );
    });

    await editor.assert.text('foo');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  test('strips rich clipboard markup when pasting into plaintext', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox blocks privileged HTML clipboard data in Playwright'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await editor.clipboard.pasteHtml('<b>abc</b>', 'abc');

    await editor.assert.blockTexts(['abc']);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    await expect(editor.root.locator('b, strong, i, em')).toHaveCount(0);
  });

  test('creates a new plain text block on Enter before follow-up typing', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Enter key proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.type('Hello');
    await page.keyboard.press('Enter');
    await page.keyboard.type('world');

    await editor.assert.blockTexts(['Hello', 'world']);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 'world'.length },
      focus: { path: [1, 0], offset: 'world'.length },
    });
  });

  test('keeps the caret at the document end through repeated Enter', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Enter key proof');

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: [''],
    });

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      await page.keyboard.type('start');

      for (let i = 0; i < 12; i += 1) {
        await page.keyboard.press('Enter');
      }

      await editor.assert.blockTexts(['start', ...new Array(12).fill('')]);
      await editor.assert.selection({
        anchor: { path: [12, 0], offset: 0 },
        focus: { path: [12, 0], offset: 0 },
      });

      await page.keyboard.type('tail');
      await editor.assert.blockTexts([
        'start',
        ...new Array(11).fill(''),
        'tail',
      ]);
      await editor.assert.selection({
        anchor: { path: [12, 0], offset: 'tail'.length },
        focus: { path: [12, 0], offset: 'tail'.length },
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps selection synchronized while typing across rapid cursor changes', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop selection proof');

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });
      let first = 'top';
      let second = 'bottom';

      await editor.selection.selectAll();
      await page.keyboard.type(first);
      await page.keyboard.press('Enter');
      await page.keyboard.type(second);

      for (let i = 0; i < 6; i += 1) {
        const topInsert = String(i);
        const bottomInsert = String.fromCharCode(97 + i);

        await editor.selection.selectDOM({
          anchor: { path: [0, 0], offset: first.length },
          focus: { path: [0, 0], offset: first.length },
        });
        await page.keyboard.type(topInsert);
        first += topInsert;

        await editor.selection.selectDOM({
          anchor: { path: [1, 0], offset: second.length },
          focus: { path: [1, 0], offset: second.length },
        });
        await page.keyboard.type(bottomInsert);
        second += bottomInsert;
      }

      await editor.assert.blockTexts([first, second]);
      await editor.assert.selection({
        anchor: { path: [1, 0], offset: second.length },
        focus: { path: [1, 0], offset: second.length },
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('handles modified Enter and word Backspace without runtime errors', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop modifier-key proof');

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      await page.keyboard.type('alpha beta');
      await page.keyboard.press('Control+Enter');
      await page.keyboard.press('Control+Backspace');

      runtimeErrors.assertNone();
      await expect.poll(() => editor.get.selection()).not.toBe(null);
    } finally {
      runtimeErrors.stop();
    }
  });

  test('types angle brackets at the start of a line without dropping characters', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop text input proof');

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      await page.keyboard.type('<');
      await page.keyboard.type('>');

      await editor.assert.blockTexts(['<>']);
      await editor.assert.selection({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('does not fallback insert after same-text native paste', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const text = await editor.get.modelText();

    await editor.selection.selectAll();
    const beforeTraceLength = (await editor.get.kernelTrace()).length;
    await editor.clipboard.pasteText(text);
    const pasteTrace = (await editor.get.kernelTrace()).slice(
      beforeTraceLength
    );

    await expect.poll(() => editor.get.modelText()).toBe(text);
    expect(
      pasteTrace.some(
        (entry) =>
          entry.eventFamily === 'paste' && entry.command?.kind === 'insert-data'
      )
    ).toBe(true);
    expect(
      pasteTrace.some(
        (entry) =>
          entry.eventFamily === 'repair' &&
          entry.command?.kind === 'insert-text'
      )
    ).toBe(false);
  });

  test('copies and cuts selected plain text with keyboard shortcuts', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit blocks privileged clipboard reads in Playwright'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const originalText = 'This is editable plain text, just like a <textarea>!';
    const selectionStart = 'This is '.length;
    const selectionEnd = selectionStart + 'editable'.length;

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: selectionStart },
      focus: { path: [0, 0], offset: selectionEnd },
    });
    await editor.root.press('ControlOrMeta+C');

    await expect.poll(() => editor.clipboard.readText()).toBe('editable');
    await editor.assert.text(originalText);

    await editor.root.press('ControlOrMeta+X');

    await expect.poll(() => editor.clipboard.readText()).toBe('editable');
    await editor.assert.text('This is  plain text, just like a <textarea>!');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: selectionStart },
      focus: { path: [0, 0], offset: selectionStart },
    });
  });

  test('copies a visually wrapped long paragraph without hard-wrap newlines', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop clipboard proof');
    test.skip(
      testInfo.project.name === 'webkit',
      'WebKit blocks privileged clipboard reads in Playwright'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const longText = [
      'Firefox should copy this visually wrapped paragraph as one logical line',
      'without adding layout-wrap newlines to the clipboard payload',
      'or to the text that is pasted back into the editor.',
    ].join(' ');

    await editor.root.evaluate((element: HTMLElement) => {
      element.style.maxWidth = '220px';
      element.style.width = '220px';
      element.style.whiteSpace = 'pre-wrap';
    });
    await editor.selectAll();
    await page.keyboard.insertText(longText);
    await editor.assert.blockTexts([longText]);

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: longText.length },
    });
    await expect.poll(() => editor.get.selectedText()).toBe(longText);

    await editor.root.press('ControlOrMeta+C');

    const copiedText = await editor.clipboard.readText();

    expect(copiedText).toBe(longText);
    expect(copiedText).not.toContain('\n');

    await editor.selectAll();
    await editor.root.press('Backspace');
    await editor.root.press('ControlOrMeta+V');

    await editor.assert.blockTexts([longText]);
  });

  test('selects all plain text through a trailing empty line', async ({
    page,
  }) => {
    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selectAll();
    await editor.deleteFragment();
    await editor.insertText('one');
    await editor.insertBreak();
    await editor.insertText('two');
    await editor.insertBreak();
    await editor.assert.blockTexts(['one', 'two', '']);

    await editor.focus();
    await page.keyboard.press('ControlOrMeta+A');

    await expect
      .poll(() => editor.get.selection())
      .toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
    await expect.poll(() => editor.get.selectedText()).toContain('one');
    await expect.poll(() => editor.get.selectedText()).toContain('two');

    await page.keyboard.press('Backspace');
    await expect.poll(() => editor.get.modelText()).toBe('');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  test('keeps repeated trailing insert breaks at the document end', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Enter key proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const initialText = 'This is editable plain text, just like a <textarea>!';
    const breakCount = 6;

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: initialText.length },
      focus: { path: [0, 0], offset: initialText.length },
    });

    for (let index = 0; index < breakCount; index++) {
      await page.keyboard.press('Enter');
      await editor.assert.selection({
        anchor: { path: [index + 1, 0], offset: 0 },
        focus: { path: [index + 1, 0], offset: 0 },
      });
    }

    await editor.assert.blockTexts([
      initialText,
      ...new Array(breakCount).fill(''),
    ]);
    await editor.assert.selection({
      anchor: { path: [breakCount, 0], offset: 0 },
      focus: { path: [breakCount, 0], offset: 0 },
    });
  });

  test('keeps Backspace in an empty first block from deleting it', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop Backspace proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('second');
    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await page.keyboard.press('Enter');
    await editor.selection.collapse({ path: [0, 0], offset: 0 });

    await editor.root.press('Backspace');

    await editor.assert.blockTexts(['', 'second']);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  test('keeps browser line-end movement within the current block', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile' || testInfo.project.name === 'webkit',
      'Desktop Chromium/Firefox line-end proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const lineEndHotkey = await getBrowserLineEndHotkey(editor.root);

    await editor.selection.selectAll();
    await page.keyboard.insertText('First line');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('Second line');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('Third line');
    await editor.assert.blockTexts(['First line', 'Second line', 'Third line']);

    await editor.selection.select({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    await page.keyboard.press(lineEndHotkey);

    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 'Second line'.length },
      focus: { path: [1, 0], offset: 'Second line'.length },
    });
    await editor.assert.domCaret({
      offset: 'Second line'.length,
      text: 'Second line',
    });
  });

  test('moves ArrowRight out of an empty leading block', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop arrow-key proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('Hello');
    await editor.selection.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await page.keyboard.press('Enter');
    await editor.assert.blockTexts(['', 'Hello']);
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await page.keyboard.press('ArrowRight');

    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    await editor.assert.domCaret({ offset: 0, text: 'Hello' });
  });

  test('moves ArrowRight and ArrowLeft into a middle empty block', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop arrow-key proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('text1');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('text2');
    await editor.assert.blockTexts(['text1', '', 'text2']);

    await editor.selection.select({
      anchor: { path: [0, 0], offset: 'text1'.length },
      focus: { path: [0, 0], offset: 'text1'.length },
    });
    await page.keyboard.press('ArrowRight');
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });

    await editor.selection.select({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
    await page.keyboard.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
  });

  test('moves word forward out of an empty leading block', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop word-navigation proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const wordForward = await getBrowserWordForwardHotkey(editor.root);

    await editor.selection.selectAll();
    await page.keyboard.insertText('Hello');
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await page.keyboard.press('Enter');
    await editor.assert.blockTexts(['', 'Hello']);
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await page.keyboard.press(wordForward);

    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    await editor.assert.domCaret({ offset: 0, text: 'Hello' });
  });

  test('keeps surrounding symbols in browser word movement', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop word-navigation proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const text = '~>>>>>p+++';

    await editor.selection.selectAll();
    await page.keyboard.insertText(text);

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: text.indexOf('p') },
      focus: { path: [0, 0], offset: text.indexOf('p') },
    });
    await page.keyboard.press(await getBrowserWordBackwardHotkey(editor.root));
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: text.indexOf('p') + 1 },
      focus: { path: [0, 0], offset: text.indexOf('p') + 1 },
    });
    await page.keyboard.press(await getBrowserWordForwardHotkey(editor.root));
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: text.length },
      focus: { path: [0, 0], offset: text.length },
    });
  });

  test('moves ArrowLeft through ligature-prone repeated letters', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop arrow-key proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('off');
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });

    await page.keyboard.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });

    await page.keyboard.press('ArrowLeft');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
  });

  test('deletes backward between identical adjacent characters', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop delete proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('aa');
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    await page.keyboard.press('Backspace');

    await editor.assert.text('a');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  test('keeps Shift+ArrowRight cross-block selection on real text', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop selection proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('B');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('A');
    await editor.assert.blockTexts(['B', 'A']);
    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');
    await page.keyboard.press('Shift+ArrowRight');

    await expect.poll(() => editor.get.selectedText()).toContain('B');
    await expect.poll(() => editor.get.selectedText()).toContain('A');
    await expect.poll(() => editor.get.selectedText()).not.toContain('\uFEFF');
  });

  test('keeps Shift+ArrowLeft backward selection inside one paragraph', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop selection proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const text = 'abcdef';

    await editor.selection.selectAll();
    await page.keyboard.insertText(text);
    await editor.selection.select({
      anchor: { path: [0, 0], offset: text.length },
      focus: { path: [0, 0], offset: text.length },
    });

    await page.keyboard.press('Shift+ArrowLeft');
    await page.keyboard.press('Shift+ArrowLeft');
    await page.keyboard.press('Shift+ArrowLeft');

    await editor.assert.selection({
      anchor: { path: [0, 0], offset: text.length },
      focus: { path: [0, 0], offset: text.length - 3 },
    });
    await expect.poll(() => editor.get.selectedText()).toBe('def');
    await editor.assert.domSelection({
      anchorNodeText: text,
      anchorOffset: text.length,
      focusNodeText: text,
      focusOffset: text.length - 3,
    });
  });

  test('deletes the current line backward without touching the previous block', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      browserName !== 'chromium' || testInfo.project.name === 'mobile',
      'Desktop Chromium hard-line-delete proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    test.skip(
      !(await isMacBrowser(editor.root)),
      'Command+Backspace hard-line-delete proof is macOS-specific'
    );

    await editor.selection.selectAll();
    await page.keyboard.insertText('foobar');
    await page.keyboard.press('Enter');
    await page.keyboard.insertText('baz');
    await editor.assert.blockTexts(['foobar', 'baz']);

    await page.keyboard.press('Meta+Backspace');

    await editor.assert.blockTexts(['foobar', '']);
    await editor.assert.selection({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    await expect.poll(() => editor.get.modelText()).toBe('foobar');
  });

  test('supports WebKit hard-line backward delete without command errors', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      browserName !== 'webkit' || testInfo.project.name === 'mobile',
      'Desktop WebKit hard-line-delete proof'
    );

    const runtimeErrors = recordSlateBrowserRuntimeErrors(page, {
      patterns: [''],
    });

    try {
      const editor = await openExample(page, 'slate/plaintext', {
        ready: {
          editor: 'visible',
        },
      });

      await editor.selection.selectAll();
      await page.keyboard.insertText('foobar');
      await page.keyboard.press('Enter');
      await page.keyboard.insertText('baz');
      await editor.assert.blockTexts(['foobar', 'baz']);

      await page.keyboard.press('Meta+Backspace');

      await editor.assert.blockTexts(['foobar', '']);
      await editor.assert.selection({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('applies deleteSoftLineBackward target ranges exactly', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox lacks compatible synthetic StaticRange beforeinput dispatch'
    );
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop synthetic beforeinput target range proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const text = 'alpha beta gamma delta epsilon zeta';
    const softLineStart = 'alpha beta '.length;

    await editor.selection.selectAll();
    await page.keyboard.insertText(text);

    await editor.root.evaluate(
      (
        element: HTMLElement,
        { rangeStart, sourceText }: { rangeStart: number; sourceText: string }
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
          throw new Error('Soft-line target text node not found');
        }

        const selection = element.ownerDocument.getSelection();
        const range = element.ownerDocument.createRange();
        range.setStart(textNode, sourceText.length);
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);

        const event = new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data: null,
          inputType: 'deleteSoftLineBackward',
        }) as InputEvent & { getTargetRanges: () => StaticRange[] };

        event.getTargetRanges = () => [
          new StaticRange({
            endContainer: textNode,
            endOffset: sourceText.length,
            startContainer: textNode,
            startOffset: rangeStart,
          }),
        ];
        element.dispatchEvent(event);
      },
      { rangeStart: softLineStart, sourceText: text }
    );

    await editor.assert.text(text.slice(0, softLineStart));
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: softLineStart },
      focus: { path: [0, 0], offset: softLineStart },
    });
  });

  test('applies deleteWord target ranges over tab whitespace exactly', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox lacks compatible synthetic StaticRange beforeinput dispatch'
    );
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop synthetic beforeinput target range proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const dispatchDeleteWordTargetRange = async ({
      caretOffset,
      endOffset,
      inputType,
      startOffset,
      text,
    }: {
      caretOffset: number;
      endOffset: number;
      inputType: 'deleteWordBackward' | 'deleteWordForward';
      startOffset: number;
      text: string;
    }) => {
      await editor.root.evaluate(
        (
          element: HTMLElement,
          {
            caretOffset,
            endOffset,
            inputType,
            sourceText,
            startOffset,
          }: {
            caretOffset: number;
            endOffset: number;
            inputType: 'deleteWordBackward' | 'deleteWordForward';
            sourceText: string;
            startOffset: number;
          }
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
            throw new Error('deleteWord target text node not found');
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

          event.getTargetRanges = () => [
            new StaticRange({
              endContainer: textNode,
              endOffset,
              startContainer: textNode,
              startOffset,
            }),
          ];
          const dispatched = element.dispatchEvent(event);

          return {
            defaultPrevented: event.defaultPrevented,
            dispatched,
            handle: (element as any).__slateBrowserHandle
              ? {
                  lastCommit: (
                    element as any
                  ).__slateBrowserHandle.getLastCommit?.(),
                  selection: (
                    element as any
                  ).__slateBrowserHandle.getSelection?.(),
                  text: (element as any).__slateBrowserHandle.getText?.(),
                  trace: (
                    element as any
                  ).__slateBrowserHandle.getKernelTrace?.(),
                }
              : null,
          };
        },
        { caretOffset, endOffset, inputType, sourceText: text, startOffset }
      );
    };

    await editor.selection.selectAll();
    await page.keyboard.insertText('foo\tbar');
    await dispatchDeleteWordTargetRange({
      caretOffset: 0,
      endOffset: 'foo\t'.length,
      inputType: 'deleteWordForward',
      startOffset: 0,
      text: 'foo\tbar',
    });
    await editor.assert.text('bar');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('foo\tbar');
    await dispatchDeleteWordTargetRange({
      caretOffset: 'foo\tbar'.length,
      endOffset: 'foo\tbar'.length,
      inputType: 'deleteWordBackward',
      startOffset: 'foo'.length,
      text: 'foo\tbar',
    });
    await editor.assert.text('foo');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'foo'.length },
      focus: { path: [0, 0], offset: 'foo'.length },
    });
  });

  test('applies delete target ranges over multi-code-unit graphemes exactly', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox lacks compatible synthetic StaticRange beforeinput dispatch'
    );
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop synthetic beforeinput target range proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const sourceText = 'a🧑‍💻b';
    const graphemeStart = 1;
    const graphemeEnd = sourceText.length - 1;

    const dispatchDeleteTargetRange = async ({
      caretOffset,
      inputType,
    }: {
      caretOffset: number;
      inputType: 'deleteContentBackward' | 'deleteContentForward';
    }) => {
      await editor.root.evaluate(
        (
          element: HTMLElement,
          {
            caretOffset,
            endOffset,
            inputType,
            sourceText,
            startOffset,
          }: {
            caretOffset: number;
            endOffset: number;
            inputType: 'deleteContentBackward' | 'deleteContentForward';
            sourceText: string;
            startOffset: number;
          }
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
            throw new Error('delete grapheme target text node not found');
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

          event.getTargetRanges = () => [
            new StaticRange({
              endContainer: textNode,
              endOffset,
              startContainer: textNode,
              startOffset,
            }),
          ];
          element.dispatchEvent(event);
        },
        {
          caretOffset,
          endOffset: graphemeEnd,
          inputType,
          sourceText,
          startOffset: graphemeStart,
        }
      );
    };

    await editor.selection.selectAll();
    await page.keyboard.insertText(sourceText);
    await dispatchDeleteTargetRange({
      caretOffset: graphemeStart,
      inputType: 'deleteContentForward',
    });
    await editor.assert.text('ab');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: graphemeStart },
      focus: { path: [0, 0], offset: graphemeStart },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText(sourceText);
    await dispatchDeleteTargetRange({
      caretOffset: graphemeEnd,
      inputType: 'deleteContentBackward',
    });
    await editor.assert.text('ab');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: graphemeStart },
      focus: { path: [0, 0], offset: graphemeStart },
    });
  });

  test('applies delete target ranges over preserved repeated spaces exactly', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox lacks compatible synthetic StaticRange beforeinput dispatch'
    );
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop synthetic beforeinput target range proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const sourceText = 'A  B';

    const dispatchDeleteSpaceTargetRange = async ({
      caretOffset,
      endOffset,
      inputType,
      startOffset,
    }: {
      caretOffset: number;
      endOffset: number;
      inputType: 'deleteContentBackward' | 'deleteContentForward';
      startOffset: number;
    }) => {
      await editor.root.evaluate(
        (
          element: HTMLElement,
          {
            caretOffset,
            endOffset,
            inputType,
            sourceText,
            startOffset,
          }: {
            caretOffset: number;
            endOffset: number;
            inputType: 'deleteContentBackward' | 'deleteContentForward';
            sourceText: string;
            startOffset: number;
          }
        ) => {
          element.style.whiteSpace = 'pre-wrap';

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
            throw new Error('delete spaces target text node not found');
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

          event.getTargetRanges = () => [
            new StaticRange({
              endContainer: textNode,
              endOffset,
              startContainer: textNode,
              startOffset,
            }),
          ];
          element.dispatchEvent(event);
        },
        { caretOffset, endOffset, inputType, sourceText, startOffset }
      );
    };

    await editor.selection.selectAll();
    await page.keyboard.insertText(sourceText);
    await dispatchDeleteSpaceTargetRange({
      caretOffset: 1,
      endOffset: 2,
      inputType: 'deleteContentForward',
      startOffset: 1,
    });
    await editor.assert.text('A B');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText(sourceText);
    await dispatchDeleteSpaceTargetRange({
      caretOffset: 3,
      endOffset: 3,
      inputType: 'deleteContentBackward',
      startOffset: 2,
    });
    await editor.assert.text('A B');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    });
  });

  test('applies beforeinput target ranges for browser text substitutions', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox lacks compatible synthetic StaticRange beforeinput dispatch'
    );
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop synthetic beforeinput target range proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('i');

    await editor.root.evaluate((element: HTMLElement) => {
      const findTextNode = (needle: string) => {
        const walker = element.ownerDocument.createTreeWalker(
          element,
          NodeFilter.SHOW_TEXT
        );

        while (walker.nextNode()) {
          const node = walker.currentNode;

          if (node.textContent?.includes(needle)) {
            return node;
          }
        }

        throw new Error(`Text node not found: ${needle}`);
      };
      const targetRanges =
        (
          startContainer: Node,
          startOffset: number,
          endContainer: Node,
          endOffset: number
        ) =>
        () => [
          new StaticRange({
            endContainer,
            endOffset,
            startContainer,
            startOffset,
          }),
        ];
      const dispatchBeforeInput = ({
        data,
        inputType,
        ranges,
      }: {
        data: string;
        inputType: string;
        ranges: () => StaticRange[];
      }) => {
        const event = new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          data,
          inputType,
        }) as InputEvent & { getTargetRanges: () => StaticRange[] };

        event.getTargetRanges = ranges;
        element.dispatchEvent(event);

        return event;
      };

      let firstTextNode = findTextNode('i');

      const insertEvent = dispatchBeforeInput({
        data: 'S',
        inputType: 'insertText',
        ranges: targetRanges(firstTextNode, 1, firstTextNode, 1),
      });
      if (!insertEvent.defaultPrevented) {
        firstTextNode.textContent += 'S';
      }
      firstTextNode = findTextNode('iS');
      const selection = element.ownerDocument.getSelection();
      const range = element.ownerDocument.createRange();

      range.setStart(firstTextNode, 2);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
      dispatchBeforeInput({
        data: 'I',
        inputType: 'insertReplacementText',
        ranges: targetRanges(firstTextNode, 0, firstTextNode, 1),
      });
      element.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          cancelable: true,
          data: 'S',
          inputType: 'insertText',
        })
      );
    });

    await editor.assert.text('IS');

    await editor.selection.selectAll();
    await page.keyboard.insertText('🙂 ');
    await editor.root.evaluate((element: HTMLElement) => {
      const walker = element.ownerDocument.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
      );
      let textNode: Node | null = null;

      while (walker.nextNode()) {
        if (walker.currentNode.textContent?.includes('🙂 ')) {
          textNode = walker.currentNode;
          break;
        }
      }

      if (!textNode) {
        throw new Error('Emoji text node not found');
      }

      const event = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        data: '. ',
        inputType: 'insertText',
      }) as InputEvent & { getTargetRanges: () => StaticRange[] };

      event.getTargetRanges = () => [
        new StaticRange({
          endContainer: textNode,
          endOffset: '🙂 '.length,
          startContainer: textNode,
          startOffset: '🙂'.length,
        }),
      ];
      element.dispatchEvent(event);
    });

    await editor.assert.text('🙂. ');
  });

  test('applies insertTranspose beforeinput as adjacent character transpose', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox lacks compatible synthetic beforeinput dispatch'
    );
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop synthetic beforeinput transpose proof'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectAll();
    await page.keyboard.insertText('abc');
    await editor.selection.select({
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });

    await editor.root.evaluate((element: HTMLElement) => {
      const dispatchTranspose = () => {
        element.dispatchEvent(
          new InputEvent('beforeinput', {
            bubbles: true,
            cancelable: true,
            inputType: 'insertTranspose',
          })
        );
      };

      dispatchTranspose();
      dispatchTranspose();
    });

    await editor.assert.text('bca');
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
  });

  test('keyboard undo restores caret after middle-line typing', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop keyboard undo repro'
    );

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const originalText = 'This is editable plain text, just like a <textarea>!';
    const editOffset = 'This is editable '.length;

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: editOffset },
      focus: { path: [0, 0], offset: editOffset },
    });
    await page.keyboard.type('abc');
    await editor.assert.text(
      'This is editable abcplain text, just like a <textarea>!'
    );

    await page.keyboard.press(await getBrowserUndoHotkey(editor.root));

    await editor.assert.text(originalText);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: editOffset },
      focus: { path: [0, 0], offset: editOffset },
    });
  });

  test('keyboard undo restores partial selected text replacement', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop keyboard undo repro'
    );
    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const originalText = 'This is editable plain text, just like a <textarea>!';
    const selectionStart = 'This is editable '.length;
    const selectionEnd = selectionStart + 'plain '.length;

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: selectionStart },
      focus: { path: [0, 0], offset: selectionEnd },
    });
    await editor.root.press('s');
    await editor.assert.text('This is editable stext, just like a <textarea>!');

    await page.keyboard.press(await getBrowserUndoHotkey(editor.root));

    await editor.assert.text(originalText);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: selectionStart },
      focus: { path: [0, 0], offset: selectionEnd },
    });
  });

  test('mouse drag undo restores manual typed replacement', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop native drag proof');

    const editor = await openExample(page, 'slate/plaintext', {
      ready: {
        editor: 'visible',
      },
    });
    const originalText = 'This is editable plain text, just like a <textarea>!';
    const selectionStart = 'This is editable '.length;
    const selectionEnd = selectionStart + 'plain '.length;

    await editor.selection.dragTextRange({
      endOffset: selectionEnd,
      startOffset: selectionStart,
      text: originalText,
    });

    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('plain ');

    await page.keyboard.type('simple');
    await editor.assert.text(
      'This is editable simpletext, just like a <textarea>!'
    );

    await page.keyboard.press(await getBrowserUndoHotkey(editor.root));

    await editor.assert.text(originalText);
    await assertSlateBrowserSelectionContract(editor, {
      domSelection: {
        anchorNodeText: originalText,
        anchorOffset: selectionStart,
        focusNodeText: originalText,
        focusOffset: selectionEnd,
      },
      selectedText: 'plain ',
      selection: {
        anchor: { path: [0, 0], offset: selectionStart },
        focus: { path: [0, 0], offset: selectionEnd },
      },
    });
  });
});
