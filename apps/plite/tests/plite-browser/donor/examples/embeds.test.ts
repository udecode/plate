import { expect, test } from '@playwright/test';
import {
  installPliteReactRenderProfiler,
  openExample,
  recordPliteBrowserRuntimeErrors,
  resetPliteReactRenderProfiler,
  takePliteBrowserRenderStateSnapshot,
} from '@platejs/browser/playwright';

test.describe('embeds example', () => {
  const pliteEditor = 'div[data-plite-editor="true"]';

  test.beforeEach(async ({ page }) => {
    await installPliteReactRenderProfiler(page);
    await page.goto('/examples/plite/embeds', { waitUntil: 'commit' });
    await expect(page.locator(pliteEditor)).toBeVisible();
  });

  test('contains embeded', async ({ page }) => {
    await expect(page.locator(pliteEditor).locator('iframe')).toHaveCount(1);
  });

  test('does not let the hidden void spacer add visible height after the url input', async ({
    page,
  }) => {
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.getByText('Try it out!')).toBeVisible();

    const gap = await page.evaluate(() => {
      const editor = document.querySelector('[data-plite-editor="true"]');
      const input = editor?.querySelector('input[type="text"]');
      const nextParagraph = Array.from(
        editor?.querySelectorAll('p') ?? []
      ).find((paragraph) => paragraph.textContent?.startsWith('Try it out!'));

      if (!(input instanceof HTMLElement) || !nextParagraph) {
        throw new Error(
          'Expected embeds example input and following paragraph'
        );
      }

      return (
        nextParagraph.getBoundingClientRect().top -
        input.getBoundingClientRect().bottom
      );
    });

    expect(gap).toBeGreaterThanOrEqual(12);
    expect(gap).toBeLessThanOrEqual(24);
  });

  test('moves from the first paragraph into the embed before the next paragraph', async ({
    browserName,
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop embed navigation proof'
    );

    const editor = await openExample(page, 'plite/embeds', {
      ready: {
        editor: 'visible',
      },
    });

    await editor.selection.selectDOM({
      anchor: { path: [0, 0], offset: 177 },
      focus: { path: [0, 0], offset: 177 },
    });
    await editor.assert.domSelectionTarget({
      anchorOffset: 177,
      anchorPath: [0, 0],
      isCollapsed: true,
    });

    await resetPliteReactRenderProfiler(page);
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [1, 0],
      isCollapsed: true,
    });

    const embedProof = await takePliteBrowserRenderStateSnapshot(editor);

    expect(embedProof.selection).toEqual({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    expect(embedProof.focusOwner.kind).toBe('editor');
    expect(embedProof.selectionShells?.anchor.node?.path).toBe('1,0');
    expect(embedProof.selectionShells?.anchor.node?.runtimeId).toBeTruthy();
    expect(embedProof.selectionShells?.anchor.element?.path).toBe('1');
    expect(embedProof.selectionShells?.anchor.element?.isVoid).toBe(true);
    expect(
      embedProof.selectionShells?.runtimeIds.length
    ).toBeGreaterThanOrEqual(2);
    expect(embedProof.renderCounts.byKind.editable ?? 0).toBeLessThanOrEqual(2);
    expect(embedProof.renderCounts.byKind.element ?? 0).toBeLessThanOrEqual(1);
    expect(embedProof.renderCounts.byKind.spacer ?? 0).toBeLessThanOrEqual(1);
    expect(embedProof.renderCounts.byKind.void ?? 0).toBeLessThanOrEqual(1);
    expect(embedProof.renderCounts.total).toBeLessThanOrEqual(5);

    await resetPliteReactRenderProfiler(page);
    await page.keyboard.press('ArrowRight');
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
    await editor.assert.domSelectionTarget({
      anchorOffset: 0,
      anchorPath: [2, 0],
      isCollapsed: true,
    });

    const afterEmbedProof = await takePliteBrowserRenderStateSnapshot(editor);

    expect(afterEmbedProof.selection).toEqual({
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    });
    expect(afterEmbedProof.selectionShells?.anchor.node?.path).toBe('2,0');
    expect(afterEmbedProof.selectionShells?.anchor.element?.path).toBe('2');
    expect(afterEmbedProof.selectionShells?.anchor.element?.isVoid).toBe(false);
    expect(
      afterEmbedProof.renderCounts.byKind.editable ?? 0
    ).toBeLessThanOrEqual(2);
    expect(
      afterEmbedProof.renderCounts.byKind.element ?? 0
    ).toBeLessThanOrEqual(1);
    expect(afterEmbedProof.renderCounts.byKind.spacer ?? 0).toBeLessThanOrEqual(
      1
    );
    expect(afterEmbedProof.renderCounts.byKind.void ?? 0).toBeLessThanOrEqual(
      1
    );
    expect(afterEmbedProof.renderCounts.total).toBeLessThanOrEqual(5);
  });

  test('serializes a custom block void drag payload without renderer wiring', async ({
    page,
  }) => {
    const editor = await openExample(page, 'plite/embeds', {
      ready: {
        editor: 'visible',
      },
    });

    const payload = await editor.root.evaluate(() => {
      const shell = document.querySelector<HTMLElement>(
        '[data-plite-editor="true"] [data-plite-node="element"][data-plite-void="true"][data-plite-path="1"]'
      );

      if (!shell) {
        throw new Error('Expected the video void shell');
      }

      const rect = shell.getBoundingClientRect();
      const dragData = new DataTransfer();
      const clientX = rect.left + Math.min(12, rect.width / 2);
      const clientY = rect.top + Math.min(12, rect.height / 2);

      shell.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
        })
      );
      shell.dispatchEvent(
        new DragEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          clientX,
          clientY,
          dataTransfer: dragData,
        })
      );

      return {
        draggable: shell.getAttribute('draggable'),
        html: dragData.getData('text/html'),
        pliteFragment: dragData.getData('application/x-plite-fragment'),
        text: dragData.getData('text/plain'),
        types: [...dragData.types],
      };
    });

    expect(payload.draggable).toBe('true');
    expect(payload.types).toEqual(
      expect.arrayContaining([
        'application/x-plite-fragment',
        'text/html',
        'text/plain',
      ])
    );
    expect(payload.pliteFragment.length).toBeGreaterThan(0);
    expect(payload.html).toContain('data-plite-fragment');
    expect(payload.text.trim()).toBe('');
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
  });

  test('moves a custom block void over a paragraph margin instead of duplicating it', async ({
    page,
  }) => {
    const runtimeErrors = await recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'plite/embeds', {
        ready: {
          editor: 'visible',
        },
      });

      await page.waitForLoadState('networkidle');

      const beforeBlockTexts = await editor.get.modelBlockTexts();
      const [introText, voidText, targetText] = beforeBlockTexts;

      expect(introText).toContain('In addition to simple image nodes');
      expect(voidText).toBe('');
      expect(targetText).toContain('Try it out!');
      await expect(editor.root.locator('iframe')).toHaveCount(1);

      const payloadTypes = await editor.root.evaluate((root) => {
        const shell = root.querySelector<HTMLElement>(
          '[data-plite-node="element"][data-plite-void="true"][data-plite-path="1"]'
        );
        const targetParagraph = Array.from(
          root.querySelectorAll<HTMLElement>('[data-plite-node="element"]')
        ).find((element) => element.textContent?.startsWith('Try it out!'));

        if (!shell || !targetParagraph) {
          throw new Error('Expected video void shell and target paragraph');
        }

        const dragData = new DataTransfer();
        const shellRect = shell.getBoundingClientRect();
        const paragraphRect = targetParagraph.getBoundingClientRect();
        const dragX = shellRect.left + Math.min(12, shellRect.width / 2);
        const dragY = shellRect.top + Math.min(12, shellRect.height / 2);
        const dropX = paragraphRect.left + paragraphRect.width / 2;
        const dropY = paragraphRect.bottom - 1;

        shell.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: dragX,
            clientY: dragY,
          })
        );
        shell.dispatchEvent(
          new DragEvent('dragstart', {
            bubbles: true,
            cancelable: true,
            clientX: dragX,
            clientY: dragY,
            dataTransfer: dragData,
          })
        );
        targetParagraph.dispatchEvent(
          new DragEvent('dragover', {
            bubbles: true,
            cancelable: true,
            clientX: dropX,
            clientY: dropY,
            dataTransfer: dragData,
          })
        );
        targetParagraph.dispatchEvent(
          new DragEvent('drop', {
            bubbles: true,
            cancelable: true,
            clientX: dropX,
            clientY: dropY,
            dataTransfer: dragData,
          })
        );
        shell.dispatchEvent(
          new DragEvent('dragend', {
            bubbles: true,
            cancelable: true,
            clientX: dropX,
            clientY: dropY,
            dataTransfer: dragData,
          })
        );

        return [...dragData.types];
      });

      expect(payloadTypes).toContain('application/x-plite-fragment');
      await expect
        .poll(() => editor.get.modelBlockTexts())
        .toEqual([introText, targetText, '']);
      await expect(editor.root.locator('iframe')).toHaveCount(1);
      await expect
        .poll(() =>
          editor.root
            .locator('[data-plite-node="element"][data-plite-void="true"]')
            .evaluateAll((elements) =>
              elements.map((element) => element.getAttribute('data-plite-path'))
            )
        )
        .toEqual(['2']);
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [2, 0], offset: 0 },
          focus: { path: [2, 0], offset: 0 },
        });
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('keeps the editor editable after a quick click on a draggable custom void', async ({
    page,
  }, testInfo) => {
    const runtimeErrors = await recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'plite/embeds', {
        ready: {
          editor: 'visible',
        },
      });

      const beforeBlockTexts = await editor.get.modelBlockTexts();
      const [introText, voidText, targetText] = beforeBlockTexts;

      expect(introText).toContain('In addition to simple image nodes');
      expect(voidText).toBe('');
      expect(targetText).toContain('Try it out!');

      const contentEditableState = await editor.root.evaluate(async (root) => {
        const shell = root.querySelector<HTMLElement>(
          '[data-plite-node="element"][data-plite-void="true"][data-plite-path="1"]'
        );

        if (!shell) {
          throw new Error('Expected video void shell');
        }

        const rect = shell.getBoundingClientRect();
        const clientX = rect.left + Math.min(12, rect.width / 2);
        const clientY = rect.top + Math.min(12, rect.height / 2);

        shell.dispatchEvent(
          new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
          })
        );
        shell.dispatchEvent(
          new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
          })
        );
        shell.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            clientX,
            clientY,
          })
        );
        await new Promise((resolve) => setTimeout(resolve, 150));

        const staleFalsePaths = Array.from(
          root.querySelectorAll<HTMLElement>('[contenteditable="false"]')
        )
          .map((element) =>
            element
              .closest('[data-plite-node="element"]')
              ?.getAttribute('data-plite-path')
          )
          .filter((path) => path === '0' || path === '2');

        return {
          rootContentEditable: root.getAttribute('contenteditable'),
          staleFalsePaths,
        };
      });

      expect(contentEditableState.rootContentEditable).toBe('true');
      expect(contentEditableState.staleFalsePaths).toEqual([]);

      await editor.selection.selectDOM({
        anchor: { path: [2, 0], offset: 0 },
        focus: { path: [2, 0], offset: 0 },
      });
      if (testInfo.project.name === 'mobile') {
        await editor.insertText('Editable ');
      } else {
        await page.keyboard.type('Editable ');
      }
      await expect
        .poll(() => editor.get.modelBlockTexts())
        .toEqual([introText, '', `Editable ${targetText}`]);
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });

  test('deselects a selected draggable custom void when clicking back into text', async ({
    page,
  }, testInfo) => {
    const runtimeErrors = await recordPliteBrowserRuntimeErrors(page);

    try {
      const editor = await openExample(page, 'plite/embeds', {
        ready: {
          editor: 'visible',
        },
      });

      const beforeBlockTexts = await editor.get.modelBlockTexts();
      const [introText, voidText, targetText] = beforeBlockTexts;

      expect(introText).toContain('In addition to simple image nodes');
      expect(voidText).toBe('');
      expect(targetText).toContain('Try it out!');

      await editor.selection.selectDOM({
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      });
      await expect
        .poll(() => editor.selection.get())
        .toEqual({
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 0 },
        });

      const paragraph = editor.root.locator(
        '[data-plite-node="element"][data-plite-path="2"]'
      );

      await paragraph.click({ position: { x: 16, y: 10 } });
      await expect
        .poll(async () => {
          const selection = await editor.selection.get();

          return (
            selection?.anchor.path[0] === 2 && selection.focus.path[0] === 2
          );
        })
        .toBe(true);

      if (testInfo.project.name === 'mobile') {
        await editor.insertText('Deselect ');
      } else {
        await page.keyboard.type('Deselect ');
      }
      await expect
        .poll(async () => {
          const blockTexts = await editor.get.modelBlockTexts();

          return {
            blockCount: blockTexts.length,
            iframeCount: await editor.root.locator('iframe').count(),
            targetHasText: blockTexts[2]?.includes('Deselect ') ?? false,
          };
        })
        .toEqual({
          blockCount: 3,
          iframeCount: 1,
          targetHasText: true,
        });
      await editor.assert.noDoubleSelectionHighlight();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  });
});
