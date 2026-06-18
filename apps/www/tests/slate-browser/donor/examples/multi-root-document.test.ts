import { expect, test } from '@playwright/test';

import { openExample } from '@platejs/browser/playwright';

const modifier = process.platform === 'darwin' ? 'Meta' : 'Control';

type EditorHarness = Awaited<ReturnType<typeof openExample>>;

const focusRootByLabel = async (
  page: Parameters<typeof openExample>[0],
  label: string,
  editor: EditorHarness
) => {
  await page.getByText(label).click({ force: true });
  await expect(editor.root).toBeFocused();
};

const insertEditorText = async (
  editor: EditorHarness,
  text: string,
  point?: { offset: number; path: number[] }
) => {
  if (point) {
    await editor.selection.collapse(point);
  }

  await editor.insertText(text);
};

const readNativeSelection = async (
  page: Parameters<typeof openExample>[0],
  rootId: string
) =>
  page.evaluate((id) => {
    const rootElement = document.getElementById(id);
    const selection = window.getSelection();

    return {
      activeElementId: document.activeElement?.id ?? null,
      anchorOffset: selection?.anchorOffset ?? null,
      focusOffset: selection?.focusOffset ?? null,
      insideRoot: Boolean(
        rootElement &&
          selection?.anchorNode &&
          rootElement.contains(selection.anchorNode)
      ),
      text: selection?.anchorNode?.textContent ?? null,
    };
  }, rootId);

const readNativeCaretAtPoint = async (
  page: Parameters<typeof openExample>[0],
  {
    rootId,
    x,
    y,
  }: {
    rootId: string;
    x: number;
    y: number;
  }
) =>
  page.evaluate(
    ({ rootId, x, y }) => {
      const rootElement = document.getElementById(rootId);

      if (!rootElement) {
        throw new Error(`Cannot find root "${rootId}"`);
      }

      const ownerDocument = rootElement.ownerDocument as Document & {
        caretPositionFromPoint?: (
          x: number,
          y: number
        ) => { offset: number; offsetNode: Node } | null;
        caretRangeFromPoint?: (x: number, y: number) => Range | null;
      };
      const caretPosition = ownerDocument.caretPositionFromPoint?.(x, y);
      const caretRange =
        caretPosition == null
          ? ownerDocument.caretRangeFromPoint?.(x, y)
          : null;
      const node = caretPosition?.offsetNode ?? caretRange?.startContainer;
      const offset = caretPosition?.offset ?? caretRange?.startOffset;

      if (!node || offset == null) {
        throw new Error(`Cannot resolve native caret at ${x},${y}`);
      }

      return {
        insideRoot: rootElement.contains(node),
        offset,
        text: node.textContent,
      };
    },
    { rootId, x, y }
  );

const clickTextOffset = async (
  page: Parameters<typeof openExample>[0],
  {
    offset,
    rootId,
    text,
  }: {
    offset: number;
    rootId: string;
    text: string;
  }
) => {
  const point = await page.evaluate(
    ({ offset, rootId, text }) => {
      const root = document.getElementById(rootId);

      if (!root) {
        throw new Error(`Cannot find root "${rootId}"`);
      }

      root.scrollIntoView({ block: 'center', inline: 'nearest' });

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        if (!node.nodeValue?.includes(text)) {
          continue;
        }

        const textNode = node as Text;
        const range = document.createRange();

        if (offset > 0) {
          range.setStart(textNode, offset - 1);
          range.setEnd(textNode, offset);
        } else {
          range.setStart(textNode, 0);
          range.setEnd(textNode, Math.min(1, textNode.length));
        }

        const rects = Array.from(range.getClientRects());
        const rect =
          offset > 0
            ? (rects.at(-1) ?? range.getBoundingClientRect())
            : (rects[0] ?? range.getBoundingClientRect());

        return {
          x: offset > 0 ? rect.right + 1 : rect.left,
          y: rect.top + rect.height / 2,
        };
      }

      throw new Error(`Cannot find text "${text}" in root "${rootId}"`);
    },
    { offset, rootId, text }
  );

  await page.mouse.click(point.x, point.y);
};

test.describe('multi-root document example', () => {
  test('keeps root chrome, editors, and status badges inside the document frame', async ({
    page,
  }) => {
    await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const overflow = await page.evaluate(() => {
      const frame = document.querySelector(
        '.slate-multi-root-document-document'
      );
      const elements = Array.from(
        document.querySelectorAll(
          [
            '.slate-multi-root-document-root-header',
            '.slate-multi-root-document-editor',
            '[data-slot="badge"]',
          ].join(',')
        )
      );

      if (!frame) {
        throw new Error('Missing multi-root document frame');
      }

      const frameRect = frame.getBoundingClientRect();

      return elements
        .map((element) => {
          const rect = element.getBoundingClientRect();

          return {
            id: element.id,
            className: String(element.getAttribute('class') ?? ''),
            left: rect.left,
            right: rect.right,
            text: element.textContent?.trim().slice(0, 80) ?? '',
          };
        })
        .filter(
          (item) =>
            item.left < frameRect.left - 1 || item.right > frameRect.right + 1
        );
    });

    expect(overflow).toEqual([]);
  });

  test('edits header, body, footer, and document title through one runtime', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const footer = page.locator('#multi-root-footer');
    const headerEditor = bodyEditor.rootAt('#multi-root-header');
    const footerEditor = bodyEditor.rootAt('#multi-root-footer');
    const titleInput = page.getByLabel('Document title');
    const commitStatus = page.locator('#multi-root-commit');

    await expect(page.locator('.example-page-title')).toContainText(
      'Multi-root Document'
    );
    await expect(titleInput).toHaveValue('Q2 Operating Plan');
    await expect(header).toContainText('Confidential quarterly plan');
    await expect(bodyEditor.root).toContainText(
      'The body root carries the document content.'
    );
    await expect(footer).toContainText('Prepared for leadership review');

    await focusRootByLabel(page, 'Header editor', headerEditor);
    await insertEditorText(headerEditor, 'Draft ', {
      path: [0, 0],
      offset: 'Confidential quarterly plan'.length,
    });
    await expect(header).toContainText('Confidential quarterly plan');
    await expect(header).toContainText('Draft ');
    await expect(page.locator('#multi-root-header-status')).toContainText(
      'header:'
    );
    await expect(page.locator('#multi-root-header-status')).toContainText(
      'Draft '
    );

    await focusRootByLabel(page, 'Body editor', bodyEditor);
    await insertEditorText(bodyEditor, ' Body prefix: ', {
      path: [0, 0],
      offset: 'The body root carries the document content.'.length,
    });
    await expect(main).toContainText('Body prefix: ');
    await expect(page.locator('#multi-root-body-status')).toContainText(
      'body:The body root carries the document content.'
    );
    await expect(page.locator('#multi-root-body-status')).toContainText(
      'Body prefix:'
    );

    await focusRootByLabel(page, 'Footer editor', footerEditor);
    await insertEditorText(footerEditor, ' Footer note: ', {
      path: [0, 0],
      offset: 'Prepared for leadership review'.length,
    });
    await expect(footer).toContainText('Prepared for leadership review');
    await expect(footer).toContainText('Footer note: ');
    await expect(page.locator('#multi-root-footer-status')).toContainText(
      'footer:'
    );
    await expect(page.locator('#multi-root-footer-status')).toContainText(
      'Footer note: '
    );

    await titleInput.click();
    await titleInput.fill('Q2 Operating Plan v2');

    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Operating Plan v2');
    await expect(page.locator('#multi-root-title')).toHaveText(
      'title:Q2 Operating Plan v2'
    );
    await expect(commitStatus).toContainText('state:document.title');
    await expect(header).not.toBeFocused();
    await expect(main).not.toBeFocused();
    await expect(footer).not.toBeFocused();
    expect(pageErrors).toEqual([]);
  });

  test('keeps undo redo and follow-up typing in the active root', async ({
    page,
  }) => {
    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const headerEditor = bodyEditor.rootAt('#multi-root-header');
    const titleInput = page.getByLabel('Document title');
    const commitStatus = page.locator('#multi-root-commit');

    await focusRootByLabel(page, 'Header editor', headerEditor);
    await insertEditorText(headerEditor, 'Alpha ', {
      path: [0, 0],
      offset: 'Confidential quarterly plan'.length,
    });
    await expect(header).toContainText('Alpha ');

    await page.getByRole('button', { name: 'Undo document change' }).click();
    await expect(header).not.toContainText('Alpha ');
    await expect(commitStatus).toContainText('tags:historic');

    await page.getByRole('button', { name: 'Redo document change' }).click();
    await expect(header).toContainText('Alpha ');

    await titleInput.click();
    await titleInput.fill('Q2 Operating Plan draft');
    await expect(titleInput).toBeFocused();
    await expect(titleInput).toHaveValue('Q2 Operating Plan draft');
    await expect(header).toContainText('Alpha ');

    await focusRootByLabel(page, 'Body editor', bodyEditor);
    await insertEditorText(bodyEditor, 'Beta ', {
      path: [0, 0],
      offset: 'The body root carries the document content.'.length,
    });
    await expect(main).toContainText('Beta ');
    await expect(header).toContainText('Confidential quarterly plan');
    await expect(header).toContainText('Alpha ');
  });

  test("document undo keeps the focused root caret when undoing another root's batch", async ({
    page,
  }) => {
    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const headerEditor = bodyEditor.rootAt('#multi-root-header');

    await focusRootByLabel(page, 'Header editor', headerEditor);
    await insertEditorText(headerEditor, 'ONE', {
      path: [0, 0],
      offset: 'Confidential quarterly plan'.length,
    });
    await expect(header).toContainText('planONE');

    await focusRootByLabel(page, 'Body editor', bodyEditor);
    await insertEditorText(bodyEditor, 'TWO', {
      path: [0, 0],
      offset: 'The body root carries the document content.'.length,
    });
    await expect(main).toContainText('TWO');

    const bodySelectionAfterTyping = await page.evaluate(() => {
      const bodyElement = document.getElementById('multi-root-body');
      const selection = window.getSelection();

      return {
        activeElementId: document.activeElement?.id ?? null,
        anchorOffset: selection?.anchorOffset ?? null,
        focusOffset: selection?.focusOffset ?? null,
        insideBody: Boolean(
          bodyElement &&
            selection?.anchorNode &&
            bodyElement.contains(selection.anchorNode)
        ),
        text: selection?.anchorNode?.textContent ?? null,
      };
    });

    expect(bodySelectionAfterTyping).toMatchObject({
      activeElementId: 'multi-root-body',
      insideBody: true,
    });

    await page.getByRole('button', { name: 'Undo document change' }).click();

    await expect(header).toContainText('planONE');
    await expect(main).not.toContainText('TWO');
    await expect(main).toBeFocused();

    const bodySelectionAfterBodyUndo = await page.evaluate(() => {
      const bodyElement = document.getElementById('multi-root-body');
      const selection = window.getSelection();

      return {
        activeElementId: document.activeElement?.id ?? null,
        anchorOffset: selection?.anchorOffset ?? null,
        focusOffset: selection?.focusOffset ?? null,
        insideBody: Boolean(
          bodyElement &&
            selection?.anchorNode &&
            bodyElement.contains(selection.anchorNode)
        ),
        text: selection?.anchorNode?.textContent ?? null,
      };
    });

    expect(bodySelectionAfterBodyUndo).toMatchObject({
      activeElementId: 'multi-root-body',
      insideBody: true,
    });

    await page.getByRole('button', { name: 'Undo document change' }).click();

    await expect(header).not.toContainText('ONE');
    await expect(main).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const bodyElement = document.getElementById('multi-root-body');
          const selection = window.getSelection();

          return Boolean(
            bodyElement &&
              selection?.anchorNode &&
              bodyElement.contains(selection.anchorNode)
          );
        })
      )
      .toBe(true);

    const bodySelectionAfterHeaderUndo = await page.evaluate(() => {
      const bodyElement = document.getElementById('multi-root-body');
      const selection = window.getSelection();

      return {
        activeElementId: document.activeElement?.id ?? null,
        anchorOffset: selection?.anchorOffset ?? null,
        focusOffset: selection?.focusOffset ?? null,
        insideBody: Boolean(
          bodyElement &&
            selection?.anchorNode &&
            bodyElement.contains(selection.anchorNode)
        ),
        text: selection?.anchorNode?.textContent ?? null,
      };
    });

    expect(bodySelectionAfterHeaderUndo).toEqual(bodySelectionAfterBodyUndo);

    await page.keyboard.press('T');
    await expect(main).toContainText(`${bodySelectionAfterBodyUndo.text}T`);
    await expect(header).not.toContainText('planT');
  });

  test("keyboard undo keeps typing in the preserved focused root after undoing another root's batch", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop hardware undo proof'
    );

    await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const commitStatus = page.locator('#multi-root-commit');
    const headerText = 'Confidential quarterly plan';
    const bodyText = 'The body root carries the document content.';
    const undoHotkey = (await page.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
    ))
      ? 'Meta+Z'
      : 'Control+Z';
    await clickTextOffset(page, {
      offset: headerText.length,
      rootId: 'multi-root-header',
      text: headerText,
    });
    await expect(header).toBeFocused();
    await page.keyboard.press('p');
    await expect(header).toContainText(`${headerText}p`);
    await expect(commitStatus).toContainText('roots:header');

    await clickTextOffset(page, {
      offset: bodyText.length,
      rootId: 'multi-root-body',
      text: bodyText,
    });
    await expect(main).toBeFocused();
    await page.keyboard.press('b');
    await expect(main).toContainText(`${bodyText}b`);
    await expect(commitStatus).toContainText('roots:body');

    await main.press(undoHotkey);

    await expect(main).not.toContainText(`${bodyText}b`);
    await expect(header).toContainText(`${headerText}p`);
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-body'))
      .toMatchObject({
        activeElementId: 'multi-root-body',
        insideRoot: true,
        text: bodyText,
      });

    await main.press(undoHotkey);

    await expect(header).not.toContainText(`${headerText}p`);
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-body'))
      .toMatchObject({
        activeElementId: 'multi-root-body',
        insideRoot: true,
        text: bodyText,
      });

    await page.keyboard.press('x');

    await expect(main).toContainText(`${bodyText}x`);
    await expect(header).not.toContainText('x');
    await expect(header).toContainText(headerText);
  });

  test('keyboard undo from footer keeps body DOM and model rooted across repeated undo', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop hardware undo proof'
    );

    await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const main = page.locator('#multi-root-body');
    const footer = page.locator('#multi-root-footer');
    const bodyText = 'The body root carries the document content.';
    const footerText = 'Prepared for leadership review';
    const undoHotkey = (await page.evaluate(() =>
      /Mac OS X/.test(navigator.userAgent)
    ))
      ? 'Meta+Z'
      : 'Control+Z';
    await clickTextOffset(page, {
      offset: bodyText.length,
      rootId: 'multi-root-body',
      text: bodyText,
    });
    await expect(main).toBeFocused();
    await page.keyboard.press('m');
    await expect(main).toContainText(`${bodyText}m`);
    await expect(page.locator('#multi-root-body-status')).toContainText(
      `body:${bodyText}m`
    );

    await clickTextOffset(page, {
      offset: footerText.length,
      rootId: 'multi-root-footer',
      text: footerText,
    });
    await expect(footer).toBeFocused();
    await page.keyboard.press('f');
    await expect(footer).toContainText(`${footerText}f`);
    await expect(page.locator('#multi-root-footer-status')).toContainText(
      `footer:${footerText}f`
    );

    await page.keyboard.press(undoHotkey);

    await expect(footer).toContainText(footerText);
    await expect(footer).not.toContainText(`${footerText}f`);
    await expect(main).toContainText(`${bodyText}m`);
    await expect(main).not.toContainText(footerText);
    await expect(page.locator('#multi-root-body-status')).toContainText(
      `body:${bodyText}m`
    );
    await expect(page.locator('#multi-root-footer-status')).toContainText(
      `footer:${footerText}`
    );

    await page.keyboard.press(undoHotkey);

    await expect(main).toContainText(bodyText);
    await expect(main).toContainText('Header and footer are editable roots.');
    await expect(main).not.toContainText(`${bodyText}m`);
    await expect(main).not.toContainText(footerText);
    await expect(footer).toContainText(footerText);
    await expect(page.locator('#multi-root-body-status')).toContainText(
      `body:${bodyText} Header and footer are editable roots.`
    );
    await expect(page.locator('#multi-root-footer-status')).toContainText(
      `footer:${footerText}`
    );
  });

  test('keeps repeated multi-root undo from replaying paths in the focused root', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const footer = page.locator('#multi-root-footer');
    const headerEditor = bodyEditor.rootAt('#multi-root-header');
    const footerEditor = bodyEditor.rootAt('#multi-root-footer');
    const headerText = 'Confidential quarterly plan';
    const bodyText = 'The body root carries the document content.';
    const footerText = 'Prepared for leadership review';

    await insertEditorText(headerEditor, ' H1', {
      path: [0, 0],
      offset: headerText.length,
    });
    await expect(header).toContainText('H1');

    await insertEditorText(bodyEditor, ' B1', {
      path: [0, 0],
      offset: bodyText.length,
    });
    await expect(main).toContainText('B1');

    await insertEditorText(footerEditor, ' F1', {
      path: [0, 0],
      offset: footerText.length,
    });
    await expect(footer).toContainText('F1');

    await insertEditorText(headerEditor, ' H2', {
      path: [0, 0],
      offset: headerText.length + ' H1'.length,
    });
    await expect(header).toContainText('H2');

    await insertEditorText(bodyEditor, ' B2', {
      path: [0, 0],
      offset: bodyText.length + ' B1'.length,
    });
    await expect(main).toContainText('B2');

    await headerEditor.focus();
    await expect(header).toBeFocused();

    const historyBeforeUndo = (await bodyEditor.get.history()) as {
      undos: unknown[];
    };
    expect(historyBeforeUndo.undos).toHaveLength(5);

    for (let index = 0; index < 5; index++) {
      await page.getByRole('button', { name: 'Undo document change' }).click();
    }

    await expect(header).not.toContainText('H1');
    await expect(header).not.toContainText('H2');
    await expect(main).not.toContainText('B1');
    await expect(main).not.toContainText('B2');
    await expect(footer).not.toContainText('F1');
    await expect(header).toBeFocused();
    const historyAfterUndo = (await bodyEditor.get.history()) as {
      undos: unknown[];
    };
    expect(historyAfterUndo.undos).toHaveLength(0);
    expect(pageErrors).toEqual([]);
  });

  test('focuses the header editor from the visible header area', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop native caret and physical keyboard proof'
    );

    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const headerEditor = bodyEditor.rootAt('#multi-root-header');
    const headerText = 'Confidential quarterly plan';

    await expect(main).toBeFocused();

    await focusRootByLabel(page, 'Header editor', headerEditor);
    await headerEditor.assert.selection({
      anchor: { path: [0, 0], offset: headerText.length },
      focus: { path: [0, 0], offset: headerText.length },
    });
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-header'))
      .toMatchObject({
        activeElementId: 'multi-root-header',
        anchorOffset: headerText.length,
        focusOffset: headerText.length,
        insideRoot: true,
        text: headerText,
      });

    await page.keyboard.type('Header chrome click ');
    await expect(header).toHaveText(`${headerText}Header chrome click `);
    await expect(main).not.toContainText('Header chrome click ');
  });

  test("visible root chrome restores the root's previous caret", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop keyboard proof');

    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const headerEditor = bodyEditor.rootAt('#multi-root-header');
    const headerText = 'Confidential quarterly plan';
    const headerTextWithTail = `${headerText} Tail`;

    await focusRootByLabel(page, 'Header editor', headerEditor);
    await page.keyboard.press('End');
    await page.keyboard.type(' Tail');
    await expect(header).toHaveText(headerTextWithTail);

    await focusRootByLabel(page, 'Body editor', bodyEditor);

    await focusRootByLabel(page, 'Header editor', headerEditor);
    await headerEditor.assert.selection({
      anchor: { path: [0, 0], offset: headerTextWithTail.length },
      focus: { path: [0, 0], offset: headerTextWithTail.length },
    });
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-header'))
      .toMatchObject({
        activeElementId: 'multi-root-header',
        anchorOffset: headerTextWithTail.length,
        focusOffset: headerTextWithTail.length,
        insideRoot: true,
        text: headerTextWithTail,
      });
    const insertedText = 'Z';
    const restoredHeaderText = `${headerTextWithTail}${insertedText}`;

    await page.keyboard.type(insertedText);

    await expect(header).toHaveText(restoredHeaderText);
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-header'))
      .toMatchObject({
        activeElementId: 'multi-root-header',
        anchorOffset: restoredHeaderText.length,
        focusOffset: restoredHeaderText.length,
        insideRoot: true,
        text: restoredHeaderText,
      });
    await expect(main).not.toContainText(insertedText);
  });

  test('puts a native caret in the header from the inactive header text surface', async ({
    page,
  }) => {
    await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const box = await header.boundingBox();

    if (!box) {
      throw new Error('Header editor is not visible');
    }

    await expect(main).toBeFocused();

    await page.mouse.click(box.x + 230, box.y + 24);
    await expect(header).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const headerElement = document.getElementById('multi-root-header');
          const selection = window.getSelection();

          return Boolean(
            headerElement &&
              selection?.anchorNode &&
              headerElement.contains(selection.anchorNode)
          );
        })
      )
      .toBe(true);

    await page.keyboard.type('Surface caret ');
    await expect(header).toContainText('Surface caret ');
    await expect(main).not.toContainText('Surface caret ');
  });

  test('dragging from blank header editor space does not start a projected selection', async ({
    page,
  }) => {
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const headerBox = await header.boundingBox();

    if (!headerBox) {
      throw new Error('Header editor is not visible');
    }

    await bodyEditor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    });
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('The ');

    await page.mouse.move(
      headerBox.x + headerBox.width - 8,
      headerBox.y + headerBox.height - 8
    );
    await page.mouse.down();
    await page.mouse.move(
      headerBox.x + headerBox.width - 4,
      headerBox.y + headerBox.height + 48,
      { steps: 8 }
    );
    await page.mouse.up();

    await expect
      .poll(() => page.locator('[data-slate-view-selection="true"]').count())
      .toBe(0);
    await expect
      .poll(() => page.evaluate(() => window.getSelection()?.toString() ?? ''))
      .toBe('');
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-header'))
      .toMatchObject({ insideRoot: false });
    expect(pageErrors).toEqual([]);
  });

  test('moves the native caret into body text at the clicked coordinate after typing in header', async ({
    page,
  }) => {
    await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const headerBox = await header.boundingBox();

    if (!headerBox) {
      throw new Error('Header editor is not visible');
    }

    await page.mouse.click(headerBox.x + 230, headerBox.y + 24);
    await expect(header).toBeFocused();
    await page.keyboard.type('Header native ');
    await expect(header).toContainText('Header native ');

    const mainBox = await main.boundingBox();

    if (!mainBox) {
      throw new Error('Body editor is not visible');
    }

    const bodyText = 'The body root carries the document content.';
    const bodyClick = {
      x: mainBox.x + mainBox.width - 16,
      y: mainBox.y + 24,
    };
    const expectedCaret = await readNativeCaretAtPoint(page, {
      rootId: 'multi-root-body',
      ...bodyClick,
    });

    expect(expectedCaret).toMatchObject({
      insideRoot: true,
      text: bodyText,
    });

    await page.mouse.click(bodyClick.x, bodyClick.y);
    await expect(main).toBeFocused();
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-body'))
      .toMatchObject({
        activeElementId: 'multi-root-body',
        insideRoot: true,
        text: 'The body root carries the document content.',
      });
    await expect
      .poll(async () => {
        const selection = await readNativeSelection(page, 'multi-root-body');

        return selection.anchorOffset;
      })
      .toBe(expectedCaret.offset);

    await page.keyboard.type('Body native ');
    const expectedBodyText = `${bodyText.slice(0, expectedCaret.offset)}Body native ${bodyText.slice(expectedCaret.offset)}`;

    await expect(main).toContainText('Body native ');
    await expect(main).toContainText(expectedBodyText);
    await expect(header).not.toContainText('Body native ');

    const mainText = await main.innerText();
    expect(mainText.indexOf('Body native ')).toBeGreaterThanOrEqual(0);
    expect(mainText.indexOf('Body native ')).toBeLessThan(
      mainText.indexOf('Header and footer')
    );
  });

  test('moves native focus from body to footer on the first text click', async ({
    page,
  }) => {
    await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const footer = page.locator('#multi-root-footer');
    const headerBox = await header.boundingBox();

    if (!headerBox) {
      throw new Error('Header editor is not visible');
    }

    await page.mouse.click(headerBox.x + 230, headerBox.y + 24);
    await expect(header).toBeFocused();

    const mainBox = await main.boundingBox();

    if (!mainBox) {
      throw new Error('Body editor is not visible');
    }

    await page.mouse.click(mainBox.x + 230, mainBox.y + 24);
    await expect(main).toBeFocused();

    await footer.scrollIntoViewIfNeeded();
    const footerBox = await footer.boundingBox();

    if (!footerBox) {
      throw new Error('Footer editor is not visible');
    }

    await page.mouse.click(footerBox.x + 230, footerBox.y + 24);
    await expect(footer).toBeFocused();
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-footer'))
      .toMatchObject({
        activeElementId: 'multi-root-footer',
        insideRoot: true,
        text: 'Prepared for leadership review',
      });

    await page.keyboard.type('Footer first click ');
    await expect(footer).toContainText('Footer first click ');
    await expect(main).not.toContainText('Footer first click ');
  });

  test('moves body caret to the clicked body coordinate after another root was focused', async ({
    page,
  }) => {
    await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const firstBodyText = 'The body root carries the document content.';
    const lastBodyText = 'Header and footer are editable roots.';
    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const headerBox = await header.boundingBox();
    const mainBox = await main.boundingBox();

    if (!headerBox || !mainBox) {
      throw new Error('Multi-root editors are not visible');
    }

    await page.mouse.click(mainBox.x + 210, mainBox.y + 24);
    await expect(main).toBeFocused();
    await expect
      .poll(async () => {
        const selection = await readNativeSelection(page, 'multi-root-body');

        return selection.anchorOffset;
      })
      .toBeLessThan(firstBodyText.length);

    await page.mouse.click(headerBox.x + 230, headerBox.y + 24);
    await expect(header).toBeFocused();

    const lastBodyBox = await main.getByText(lastBodyText).boundingBox();

    if (!lastBodyBox) {
      throw new Error('Last body paragraph is not visible');
    }

    const bodyClick = {
      x: mainBox.x + mainBox.width - 16,
      y: lastBodyBox.y + lastBodyBox.height / 2,
    };
    const expectedCaret = await readNativeCaretAtPoint(page, {
      rootId: 'multi-root-body',
      ...bodyClick,
    });

    expect(expectedCaret).toMatchObject({
      insideRoot: true,
      text: lastBodyText,
    });

    await page.mouse.click(bodyClick.x, bodyClick.y);
    await expect(main).toBeFocused();
    await expect
      .poll(() => readNativeSelection(page, 'multi-root-body'))
      .toMatchObject({
        activeElementId: 'multi-root-body',
        insideRoot: true,
        text: lastBodyText,
      });
    await expect
      .poll(async () => {
        const selection = await readNativeSelection(page, 'multi-root-body');

        return selection.anchorOffset;
      })
      .toBe(expectedCaret.offset);

    await page.keyboard.type(' Body padding end ');
    const expectedBodyText = `${lastBodyText.slice(0, expectedCaret.offset)} Body padding end ${lastBodyText.slice(expectedCaret.offset)}`;

    await expect(main).toContainText(expectedBodyText);
  });

  test('keeps header focus when modifier keys follow header typing', async ({
    page,
  }) => {
    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const main = page.locator('#multi-root-body');
    const headerEditor = bodyEditor.rootAt('#multi-root-header');

    await expect(main).toBeFocused();

    await focusRootByLabel(page, 'Header editor', headerEditor);
    await insertEditorText(headerEditor, 'hello', {
      path: [0, 0],
      offset: 'Confidential quarterly plan'.length,
    });
    await expect(header).toContainText('hello');
    await expect(header).not.toContainText('olleh');
    await expect(page.locator('#multi-root-header-status')).toContainText(
      'hello'
    );

    await page.keyboard.down(modifier);
    await page.keyboard.down('Shift');

    await expect(header).toBeFocused();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const headerElement = document.getElementById('multi-root-header');
          const selection = window.getSelection();

          return Boolean(
            headerElement &&
              selection?.anchorNode &&
              headerElement.contains(selection.anchorNode)
          );
        })
      )
      .toBe(true);

    await page.keyboard.up('Shift');
    await page.keyboard.up(modifier);
    await page.keyboard.press('a');

    await expect(header).toContainText('helloa');
    await expect(main).not.toContainText('helloa');
  });

  test('select-all copy paste and placeholder state are root-local', async ({
    page,
  }) => {
    const bodyEditor = await openExample(page, 'slate/multi-root-document', {
      ready: {
        editor: 'visible',
      },
      surface: {
        scope: '#multi-root-body-surface',
      },
    });

    const header = page.locator('#multi-root-header');
    const footer = page.locator('#multi-root-footer');
    const headerEditor = bodyEditor.rootAt('#multi-root-header');
    const footerEditor = bodyEditor.rootAt('#multi-root-footer');

    await focusRootByLabel(page, 'Header editor', headerEditor);
    const copiedHeader = await header.innerText();

    await focusRootByLabel(page, 'Footer editor', footerEditor);
    await expect(footer).not.toContainText('Add a running header');
    await expect(header).not.toContainText('Add a footer note');
    await expect(header).toContainText('Confidential quarterly plan');

    await footerEditor.clipboard.pasteText(copiedHeader);
    await expect(footer).toContainText('Confidential quarterly plan');
    await expect(header).toContainText('Confidential quarterly plan');

    await insertEditorText(footerEditor, ' copied');

    await expect(footer).toContainText('copied');
    await expect(header).not.toContainText('copied');
  });
});
