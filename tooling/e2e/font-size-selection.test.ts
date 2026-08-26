import { createPliteBrowserEditorHarness } from '@platejs/browser/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

const recordRuntimeErrors = (page: Page) => {
  const errors: string[] = [];
  const onConsole = (message: { text: () => string; type: () => string }) => {
    if (message.type() === 'error') errors.push(message.text());
  };
  const onPageError = (error: Error) => {
    errors.push(error.stack ?? error.message);
  };

  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  return {
    assertNone: () => expect(errors).toEqual([]),
    reset: () => {
      errors.length = 0;
    },
    stop: () => {
      page.off('console', onConsole);
      page.off('pageerror', onPageError);
    },
  };
};

const normalizeNativeSelectionText = (value: string) =>
  value.replaceAll('\uFEFF', '').replaceAll('\u00A0', '');

const readSelectionGeometry = (target: Locator) =>
  target.evaluate((element) => {
    const document = element.ownerDocument;
    const editor = document.querySelector(
      '[data-plite-editor="true"][contenteditable="true"], [data-slate-editor="true"][contenteditable="true"]'
    );
    const selection = document.defaultView?.getSelection();
    const stringHosts = Array.from(
      element.querySelectorAll<HTMLElement>(
        '[data-plite-string], [data-slate-string]'
      )
    );

    if (!selection || selection.rangeCount !== 1 || stringHosts.length === 0) {
      return null;
    }

    const selectionRect = selection.getRangeAt(0).getBoundingClientRect();
    return {
      activeInEditor: !!editor && editor.contains(document.activeElement),
      backward:
        selection.anchorNode === selection.focusNode
          ? selection.anchorOffset > selection.focusOffset
          : Boolean(
              selection.focusNode &&
              selection.anchorNode?.compareDocumentPosition(
                selection.focusNode
              ) & Node.DOCUMENT_POSITION_PRECEDING
            ),
      fontSizes: Array.from(
        new Set(
          stringHosts.map(
            (innerElement2) => getComputedStyle(innerElement2).fontSize
          )
        )
      ),
      selection: selection.toString(),
      selectionRect: {
        bottom: selectionRect.bottom,
        height: selectionRect.height,
        left: selectionRect.left,
        right: selectionRect.right,
        top: selectionRect.top,
        width: selectionRect.width,
      },
      selectionWidth: selectionRect.width,
    };
  });

const readCursorOverlayGeometry = async (
  page: Page,
  selectedBlock: Locator
) => {
  const blockBounds = await selectedBlock.evaluate((element) => {
    const rect = element.getBoundingClientRect();

    return {
      bottom: rect.bottom,
      left: rect.left,
      right: rect.right,
      top: rect.top,
    };
  });
  const overlay = await page
    .locator(
      'div[class~="pointer-events-none"][class~="absolute"][class~="bg-brand/25"]'
    )
    .evaluateAll((elements, block) => {
      const rects = elements
        .map((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);

          return {
            backgroundColor: style.backgroundColor,
            bottom: rect.bottom,
            height: rect.height,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            width: rect.width,
          };
        })
        .filter(
          (rect) =>
            rect.width > 0 &&
            rect.height > 0 &&
            rect.right > block.left &&
            rect.left < block.right &&
            rect.bottom > block.top &&
            rect.top < block.bottom
        );

      if (rects.length === 0) return null;

      return {
        backgroundColors: Array.from(
          new Set(rects.map((rect) => rect.backgroundColor))
        ),
        rect: {
          bottom: Math.max(...rects.map((rect) => rect.bottom)),
          height:
            Math.max(...rects.map((rect) => rect.bottom)) -
            Math.min(...rects.map((rect) => rect.top)),
          left: Math.min(...rects.map((rect) => rect.left)),
          right: Math.max(...rects.map((rect) => rect.right)),
          top: Math.min(...rects.map((rect) => rect.top)),
          width:
            Math.max(...rects.map((rect) => rect.right)) -
            Math.min(...rects.map((rect) => rect.left)),
        },
        rectCount: rects.length,
      };
    }, blockBounds);
  const fontSizes = await selectedBlock.evaluate((element) =>
    Array.from(
      new Set(
        Array.from(
          element.querySelectorAll<HTMLElement>(
            '[data-plite-string], [data-slate-string]'
          ),
          (stringHost) => getComputedStyle(stringHost).fontSize
        )
      )
    )
  );

  return overlay ? { ...overlay, fontSizes } : null;
};

const readModelSelectionState = async (
  browserEditor: ReturnType<typeof createPliteBrowserEditorHarness>
) => {
  const [selection, value] = await Promise.all([
    browserEditor.get.selection(),
    browserEditor.get.modelValue(),
  ]);

  if (!selection) return null;
  const comparePaths = (left: number[], right: number[]) => {
    const length = Math.max(left.length, right.length);

    for (let index = 0; index < length; index += 1) {
      const difference = (left[index] ?? -1) - (right[index] ?? -1);

      if (difference !== 0) return difference;
    }

    return 0;
  };
  const comparePoints = (
    left: { offset: number; path: number[] },
    right: { offset: number; path: number[] }
  ) => comparePaths(left.path, right.path) || left.offset - right.offset;
  const backward = comparePoints(selection.anchor, selection.focus) > 0;
  const start = backward ? selection.focus : selection.anchor;
  const end = backward ? selection.anchor : selection.focus;
  const textNodes: Array<{ path: number[]; text: string }> = [];
  const visit = (nodes: unknown, path: number[] = []) => {
    if (!Array.isArray(nodes)) return;

    nodes.forEach((node, index) => {
      if (!node || typeof node !== 'object') return;
      const nodePath = [...path, index];
      const candidate = node as { children?: unknown; text?: unknown };

      if (typeof candidate.text === 'string') {
        textNodes.push({ path: nodePath, text: candidate.text });
      } else {
        visit(candidate.children, nodePath);
      }
    });
  };

  visit((value as { children?: unknown }).children);
  const selectedText = textNodes
    .filter(
      (node) =>
        comparePaths(node.path, start.path) >= 0 &&
        comparePaths(node.path, end.path) <= 0
    )
    .map((node) => {
      const startsHere = comparePaths(node.path, start.path) === 0;
      const endsHere = comparePaths(node.path, end.path) === 0;
      const from = startsHere ? start.offset : 0;
      const to = endsHere ? end.offset : node.text.length;

      return node.text.slice(from, to);
    })
    .join('')
    .replaceAll('\uFEFF', '');

  return { backward, selectedText, selection };
};

const readPaintedSelectionWidth = async (
  page: Page,
  selectedBlock: Locator,
  selectedText: string
) => {
  const selectedScreenshot = await selectedBlock.screenshot({
    caret: 'initial',
  });
  const blockBounds = await selectedBlock.evaluate((element) => {
    const bounds = element.getBoundingClientRect();

    return {
      height: bounds.height,
      left: bounds.left,
      top: bounds.top,
      width: bounds.width,
    };
  });
  const textBounds = await selectedBlock.evaluate((element, text) => {
    const stringHosts = Array.from(
      element.querySelectorAll<HTMLElement>(
        '[data-plite-string], [data-slate-string]'
      )
    );

    if (
      stringHosts.length === 0 ||
      stringHosts.map((stringHost) => stringHost.textContent).join('') !== text
    ) {
      throw new Error(`Expected text geometry for ${text}`);
    }

    const range = element.ownerDocument.createRange();
    const firstString = stringHosts[0];
    const lastString = stringHosts.at(-1)!;

    range.setStart(firstString, 0);
    range.setEnd(lastString, lastString.childNodes.length);
    const bounds = range.getBoundingClientRect();

    return {
      bottom: bounds.bottom,
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
    };
  }, selectedText);

  return page.evaluate(
    async ({ block, screenshotBase64, text }) => {
      const bytes = Uint8Array.from(atob(screenshotBase64), (character) =>
        character.charCodeAt(0)
      );
      const bitmap = await createImageBitmap(new Blob([bytes]));

      const canvas = document.createElement('canvas');

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const context = canvas.getContext('2d');

      if (!context) throw new Error('Expected screenshot canvas context');

      context.drawImage(bitmap, 0, 0);
      const pixels = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;
      const scale = bitmap.width / block.width;
      const textLeft = Math.max(
        0,
        Math.floor((text.left - block.left) * scale)
      );
      const sampleStart = Math.min(
        bitmap.width - 8,
        Math.ceil((text.right - block.left + 24) * scale)
      );
      const rows = [
        Math.floor((text.top - block.top + 1) * scale),
        Math.floor((text.top - block.top + 2) * scale),
        Math.ceil((text.bottom - block.top - 2) * scale),
        Math.ceil((text.bottom - block.top - 1) * scale),
      ].filter((row) => row >= 0 && row < bitmap.height);
      const background = [0, 1, 2].map((channel) => {
        let total = 0;
        let count = 0;

        for (const row of rows) {
          for (let x = sampleStart; x < sampleStart + 8; x += 1) {
            total += pixels[(row * bitmap.width + x) * 4 + channel] ?? 0;
            count += 1;
          }
        }

        return total / count;
      });

      let firstX = Number.POSITIVE_INFINITY;
      let lastX = Number.NEGATIVE_INFINITY;

      for (let x = textLeft; x < sampleStart; x += 1) {
        const highlightedRows = rows.filter((row) => {
          const offset = (row * bitmap.width + x) * 4;
          const distance =
            Math.abs((pixels[offset] ?? 0) - (background[0] ?? 0)) +
            Math.abs((pixels[offset + 1] ?? 0) - (background[1] ?? 0)) +
            Math.abs((pixels[offset + 2] ?? 0) - (background[2] ?? 0));

          return distance > 40;
        }).length;

        if (highlightedRows >= Math.max(2, rows.length - 1)) {
          firstX = Math.min(firstX, x);
          lastX = Math.max(lastX, x);
        }
      }

      return Number.isFinite(firstX) ? (lastX - firstX + 1) / scale : 0;
    },
    {
      block: blockBounds,
      screenshotBase64: selectedScreenshot.toString('base64'),
      text: textBounds,
    }
  );
};

const readTextRangeRect = (
  target: Locator,
  { endOffset, startOffset }: { endOffset: number; startOffset: number }
) =>
  target.evaluate(
    (element, offsets) => {
      const walker = element.ownerDocument.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
      );
      const textNode = walker.nextNode();

      if (!textNode?.textContent) {
        throw new Error('Expected selectable reporter text');
      }

      const range = element.ownerDocument.createRange();

      range.setStart(textNode, offsets.startOffset);
      range.setEnd(textNode, offsets.endOffset);
      const rect = range.getBoundingClientRect();

      return {
        bottom: rect.bottom,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: rect.width,
      };
    },
    { endOffset, startOffset }
  );

const readSelectionLayerProfile = async (
  page: Page,
  selectedBlock: Locator,
  scanRect: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  }
) => {
  const screenshot = await selectedBlock.screenshot({ caret: 'initial' });
  const blockBounds = await selectedBlock.evaluate((element) => {
    const rect = element.getBoundingClientRect();

    return {
      height: rect.height,
      left: rect.left,
      top: rect.top,
      width: rect.width,
    };
  });

  return page.evaluate(
    async ({ block, probe, screenshotBase64 }) => {
      const bytes = Uint8Array.from(atob(screenshotBase64), (character) =>
        character.charCodeAt(0)
      );
      const bitmap = await createImageBitmap(new Blob([bytes]));
      const canvas = document.createElement('canvas');

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Expected screenshot canvas context');
      context.drawImage(bitmap, 0, 0);
      const pixels = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      ).data;
      const scale = bitmap.width / block.width;
      const left = Math.max(0, Math.floor((probe.left - block.left) * scale));
      const right = Math.min(
        bitmap.width,
        Math.ceil((probe.right - block.left) * scale)
      );
      const top = Math.max(0, Math.floor((probe.top - block.top) * scale));
      const bottom = Math.min(
        bitmap.height,
        Math.ceil((probe.bottom - block.top) * scale)
      );
      const colors = new Map<
        string,
        { count: number; longestRun: number; rows: number }
      >();
      const quantize = (value: number) =>
        Math.min(255, Math.round(value / 32) * 32);
      const minimumLayerRunPixels = Math.max(
        8,
        Math.floor((right - left) * 0.12)
      );
      const minimumLayerRows = Math.max(2, Math.floor((bottom - top) * 0.08));

      for (let y = top; y < bottom; y += 1) {
        const rowColors = new Map<
          string,
          { count: number; longestRun: number }
        >();
        let activeColor: string | null = null;
        let activeRun = 0;

        for (let x = left; x < right; x += 1) {
          const offset = (y * bitmap.width + x) * 4;
          const red = pixels[offset] ?? 0;
          const green = pixels[offset + 1] ?? 0;
          const blue = pixels[offset + 2] ?? 0;

          if (blue < green + 12 || blue < red + 24) {
            activeColor = null;
            activeRun = 0;
            continue;
          }
          const color = [quantize(red), quantize(green), quantize(blue)].join(
            ','
          );
          const rowColor = rowColors.get(color) ?? {
            count: 0,
            longestRun: 0,
          };

          activeRun = activeColor === color ? activeRun + 1 : 1;
          activeColor = color;
          rowColor.count += 1;
          rowColor.longestRun = Math.max(rowColor.longestRun, activeRun);
          rowColors.set(color, rowColor);
        }

        for (const [color, rowColor] of rowColors) {
          const stats = colors.get(color) ?? {
            count: 0,
            longestRun: 0,
            rows: 0,
          };

          stats.count += rowColor.count;
          stats.longestRun = Math.max(stats.longestRun, rowColor.longestRun);
          if (rowColor.longestRun >= minimumLayerRunPixels) {
            stats.rows += 1;
          }
          colors.set(color, stats);
        }
      }

      const layers = Array.from(colors, ([color, stats]) => ({
        color,
        ...stats,
      }))
        .filter(({ rows }) => rows >= minimumLayerRows)
        .sort((leftLayer, rightLayer) => rightLayer.count - leftLayer.count);

      return {
        layerCount: layers.length,
        layers,
        minimumLayerRows,
        minimumLayerRunPixels,
      };
    },
    {
      block: blockBounds,
      probe: scanRect,
      screenshotBase64: screenshot.toString('base64'),
    }
  );
};

const addDuplicateSelectionControl = async (
  page: Page,
  rect: { height: number; left: number; top: number; width: number }
) => {
  await page.evaluate((probe) => {
    const overlay = document.createElement('div');

    overlay.dataset.plate5091DuplicateControl = 'true';
    overlay.style.background = 'rgba(0, 112, 255, 0.22)';
    overlay.style.height = `${probe.height}px`;
    overlay.style.left = `${probe.left}px`;
    overlay.style.pointerEvents = 'none';
    overlay.style.position = 'fixed';
    overlay.style.top = `${probe.top}px`;
    overlay.style.width = `${Math.max(8, probe.width * 0.35)}px`;
    overlay.style.zIndex = '2147483647';
    document.body.append(overlay);
  }, rect);
};

const removeDuplicateSelectionControl = (page: Page) =>
  page.evaluate(() => {
    document
      .querySelector('[data-plate5091-duplicate-control="true"]')
      ?.remove();
  });

test('font-size command refreshes expanded selection paint (#5091)', async ({
  page,
}) => {
  const cases = [
    {
      endOffset: 54,
      id: 'full-bullet',
      expectedBackward: true,
      selectionMethod: 'backward-mouse',
      selectedText: 'Edit existing text (improve, fix grammar, change tone)',
      startOffset: 0,
      targetText: 'Edit existing text (improve, fix grammar, change tone)',
    },
    {
      endOffset: 45,
      id: 'summarize',
      expectedBackward: false,
      selectionMethod: 'mouse-drag',
      selectedText: 'summarize',
      startOffset: 36,
      targetText: 'Generate content (continue writing, summarize, explain)',
    },
    {
      endOffset: 16,
      id: 'content',
      expectedBackward: false,
      selectionMethod: 'mouse-drag',
      selectedText: 'content',
      startOffset: 9,
      targetText: 'Generate content (continue writing, summarize, explain)',
    },
    {
      endOffset: 42,
      id: 'mixed-suggestion-boundary',
      expectedBackward: false,
      selectionMethod: 'mouse-drag',
      selectedText: 'content seamlessly. Use ',
      startOffset: 18,
      targetText: 'Review and refine content seamlessly. Use ',
    },
  ] as const;

  for (const selectionCase of cases) {
    await page.goto('/');
    const editor = page.locator(
      '[data-plite-editor="true"][contenteditable="true"], [data-slate-editor="true"][contenteditable="true"]'
    );
    const target = page.getByText(selectionCase.targetText, { exact: true });
    const selectedBlock = target.locator(
      'xpath=ancestor::*[@data-plite-node="element" or @data-slate-node="element"][1]'
    );
    const fontSizeInput = page.locator(
      'input[data-plate-focus="true"][value="16"]'
    );

    await expect(editor).toHaveCount(1);
    await expect(target).toBeVisible();
    await page.waitForLoadState('networkidle');
    const selectedBlockKey = await selectedBlock.getAttribute(
      'data-plite-node-key'
    );
    const stableSelectedBlock = selectedBlockKey
      ? editor.locator(
          `[data-plite-node="element"][data-plite-node-key="${selectedBlockKey}"]`
        )
      : selectedBlock;

    const runtimeErrors = recordRuntimeErrors(page);

    try {
      await target.scrollIntoViewIfNeeded();
      const expectedSelectionRect = await readTextRangeRect(target, {
        endOffset: selectionCase.endOffset,
        startOffset: selectionCase.startOffset,
      });
      const absentLayerProfile = await readSelectionLayerProfile(
        page,
        stableSelectedBlock,
        expectedSelectionRect
      );

      expect(
        absentLayerProfile.layerCount,
        `${selectionCase.id}: absent=${JSON.stringify(absentLayerProfile)}`
      ).toBe(0);
      if (selectionCase.id !== 'mixed-suggestion-boundary') {
        expect(
          await readPaintedSelectionWidth(
            page,
            stableSelectedBlock,
            selectionCase.targetText
          )
        ).toBe(0);
      }
      const browserEditor = createPliteBrowserEditorHarness(
        page,
        'playground',
        editor
      );

      await browserEditor.selection.dragTextRange({
        direction:
          selectionCase.selectionMethod === 'backward-mouse'
            ? 'backward'
            : 'forward',
        endAffinity:
          selectionCase.id === 'mixed-suggestion-boundary' ? 'before' : 'after',
        endOffset: selectionCase.endOffset,
        settleMs: 25,
        startOffset: selectionCase.startOffset,
        steps: 24,
        text: selectionCase.targetText,
      });
      await page.waitForTimeout(100);
      const selectionSetup = await readSelectionGeometry(stableSelectedBlock);

      if (
        normalizeNativeSelectionText(selectionSetup?.selection ?? '') !==
        selectionCase.selectedText
      ) {
        const snapshot = await browserEditor.snapshot();

        throw new Error(
          `${selectionCase.id}: selection setup failed ${JSON.stringify({
            domSelection: snapshot.domSelection,
            focusOwner: snapshot.focusOwner,
            kernelTrace: snapshot.kernelTrace.slice(-8),
            lastCommit: snapshot.lastCommit,
            modelSelection: snapshot.selection,
            nativeSelection: selectionSetup?.selection ?? null,
          })}`
        );
      }
      await expect(
        editor.locator('[data-plite-view-selection="true"]')
      ).toHaveCount(0);
      await expect
        .poll(async () => {
          const geometry = await readSelectionGeometry(stableSelectedBlock);

          return geometry
            ? {
                ...geometry,
                selection: normalizeNativeSelectionText(geometry.selection),
              }
            : null;
        })
        .toMatchObject({
          activeInEditor: true,
          backward: selectionCase.expectedBackward,
          fontSizes: ['16px'],
          selection: selectionCase.selectedText,
        });
      runtimeErrors.reset();

      const before = await readSelectionGeometry(stableSelectedBlock);

      if (!before) throw new Error('Expected initial selection geometry');
      const singleLayerProfile = await readSelectionLayerProfile(
        page,
        stableSelectedBlock,
        before.selectionRect
      );

      expect(
        singleLayerProfile.layerCount,
        `${selectionCase.id}: single=${JSON.stringify(singleLayerProfile)}`
      ).toBe(1);
      await addDuplicateSelectionControl(page, before.selectionRect);
      try {
        const duplicateLayerProfile = await readSelectionLayerProfile(
          page,
          stableSelectedBlock,
          before.selectionRect
        );

        expect(
          duplicateLayerProfile.layerCount,
          `${selectionCase.id}: duplicate=${JSON.stringify(duplicateLayerProfile)}`
        ).toBeGreaterThanOrEqual(2);
      } finally {
        await removeDuplicateSelectionControl(page);
      }

      if (selectionCase.id !== 'mixed-suggestion-boundary') {
        await expect
          .poll(
            async () =>
              Math.abs(
                (await readPaintedSelectionWidth(
                  page,
                  stableSelectedBlock,
                  selectionCase.targetText
                )) - before.selectionWidth
              ),
            { timeout: 2000 }
          )
          .toBeLessThan(3);
      }
      const modelSelectionBefore = await readModelSelectionState(browserEditor);

      if (!modelSelectionBefore) {
        throw new Error('Expected model selection before font-size action');
      }
      expect(modelSelectionBefore).toMatchObject({
        backward: selectionCase.expectedBackward,
        selectedText: selectionCase.selectedText,
      });

      await fontSizeInput.click();
      await page.getByRole('button', { exact: true, name: '10' }).click();

      await expect
        .poll(() => readModelSelectionState(browserEditor))
        .toMatchObject({
          backward: selectionCase.expectedBackward,
          selectedText: selectionCase.selectedText,
        });
      await expect.poll(() => browserEditor.get.domSelection()).toBeNull();
      await expect
        .poll(() =>
          page.evaluate(() => ({
            activeInEditor: Boolean(
              document
                .querySelector('[data-plite-editor="true"]')
                ?.contains(document.activeElement)
            ),
            nativeText: window.getSelection()?.toString() ?? '',
          }))
        )
        .toEqual({ activeInEditor: false, nativeText: '' });
      await expect
        .poll(() => readCursorOverlayGeometry(page, stableSelectedBlock))
        .not.toBeNull();
      const cursorOverlay = await readCursorOverlayGeometry(
        page,
        stableSelectedBlock
      );

      if (!cursorOverlay) {
        throw new Error('Expected cursor selection overlay after font size');
      }
      const after = {
        fontSizes: cursorOverlay.fontSizes,
        selectionRect: cursorOverlay.rect,
        selectionWidth: cursorOverlay.rect.width,
      };

      expect(after.fontSizes).toContain('10px');
      expect(after.selectionWidth).toBeLessThan(before.selectionWidth * 0.8);
      expect(cursorOverlay.rectCount).toBeGreaterThan(0);
      expect(cursorOverlay.backgroundColors).not.toEqual([]);
      await expect(
        editor.locator('[data-plite-view-selection="true"]')
      ).toHaveCount(0);
      // Check the settled paint after the toolbar popover closes.
      await page.waitForTimeout(200);
      const paintProbe = {
        bottom: Math.max(
          before.selectionRect.bottom,
          after.selectionRect.bottom
        ),
        left: Math.min(before.selectionRect.left, after.selectionRect.left),
        right: Math.max(before.selectionRect.right, after.selectionRect.right),
        top: Math.min(before.selectionRect.top, after.selectionRect.top),
      };
      const finalLayerProfile = await readSelectionLayerProfile(
        page,
        stableSelectedBlock,
        paintProbe
      );

      expect(
        finalLayerProfile.layerCount,
        `${selectionCase.id}: final=${JSON.stringify(finalLayerProfile)}`
      ).toBe(1);
      await expect
        .poll(() => readModelSelectionState(browserEditor))
        .toMatchObject({
          backward: selectionCase.expectedBackward,
          selectedText: selectionCase.selectedText,
        });
      await expect.poll(() => browserEditor.get.domSelection()).toBeNull();
      runtimeErrors.assertNone();
    } finally {
      runtimeErrors.stop();
    }
  }
});
