import { expect, type Page, test } from '@playwright/test';
import {
  attachBrowserJsonArtifact,
  attachBrowserSelectionScreenshot,
  openExample,
  type BrowserEditorHarness,
} from '@platejs/test/playwright';

const hugeDocumentReadyTimeout = 90 * 1000;

type PliteBrowserHandleSelection = {
  anchor: { offset: number; path: number[] };
  focus: { offset: number; path: number[] };
};

type PliteBrowserHandleElement = HTMLElement & {
  __pliteBrowserHandle?: {
    getSelection?: () => PliteBrowserHandleSelection | null;
    getViewSelection?: () => {
      anchor: { point: { offset: number; path: number[] } };
      focus: { point: { offset: number; path: number[] } };
    } | null;
    scrollPathIntoView?: (path: number[], align: 'center') => boolean;
  };
};

type HugeDocumentKeyboardProfilerEvent = {
  duration?: number;
  id?: string | null;
  kind?: string;
};

type HugeDocumentKeyboardProfiler = {
  events: HugeDocumentKeyboardProfilerEvent[];
  reset: () => void;
  snapshot: () => HugeDocumentKeyboardProfilerEvent[];
};

type HugeDocumentKeyboardProfilerWindow = Window &
  typeof globalThis & {
    __HUGE_DOCUMENT_KEYDOWN_PROFILER__?: HugeDocumentKeyboardProfiler;
    __EDITOR_REACT_RENDER_PROFILER__?: {
      record: (event: HugeDocumentKeyboardProfilerEvent) => void;
    };
  };

test.setTimeout(120 * 1000);

const scrollContainersAwayFromCaret = async (
  editor: BrowserEditorHarness
) =>
  editor.root.evaluate((element: HTMLElement) => {
    for (
      let parent: HTMLElement | null = element;
      parent;
      parent = parent.parentElement
    ) {
      if (parent.scrollHeight > parent.clientHeight) {
        parent.scrollTop = 0;
      }
    }
    window.scrollTo(0, 0);
  });

const getScrollableParentState = async (editor: BrowserEditorHarness) =>
  editor.root.evaluate((element: HTMLElement) => {
    const parents: Array<{
      clientHeight: number;
      scrollHeight: number;
      scrollTop: number;
    }> = [
      {
        clientHeight: window.innerHeight,
        scrollHeight: document.documentElement.scrollHeight,
        scrollTop: window.scrollY,
      },
    ];

    for (
      let parent: HTMLElement | null = element;
      parent;
      parent = parent.parentElement
    ) {
      if (parent.scrollHeight > parent.clientHeight) {
        parents.push({
          clientHeight: parent.clientHeight,
          scrollHeight: parent.scrollHeight,
          scrollTop: parent.scrollTop,
        });
      }
    }

    return parents;
  });

const scrollBlockIntoView = async (
  editor: BrowserEditorHarness,
  blockIndex: number
) => {
  await editor.root
    .locator(`[data-editor-node="element"][data-editor-path="${blockIndex}"]`)
    .scrollIntoViewIfNeeded();
};

const clickTextBlock = async (
  editor: BrowserEditorHarness,
  blockIndex: number
) => {
  const point = await editor.root.evaluate((element: HTMLElement, index) => {
    const textElement = element.querySelector<HTMLElement>(
      `[data-editor-node="text"][data-editor-path="${index},0"]`
    );

    if (!textElement) {
      throw new Error(`Missing text element for block ${index}`);
    }

    const rect = textElement.getBoundingClientRect();

    return {
      x: rect.left + Math.min(rect.width - 4, Math.max(4, rect.width * 0.75)),
      y: rect.top + rect.height / 2,
    };
  }, blockIndex);

  await editor.page.mouse.click(point.x, point.y);
};

const focusNonEditorSentinel = async (page: Page) => {
  await page.evaluate(() => {
    const id = 'huge-document-refocus-sentinel';
    let sentinel = document.getElementById(id) as HTMLButtonElement | null;

    if (!sentinel) {
      sentinel = document.createElement('button');
      sentinel.id = id;
      sentinel.type = 'button';
      sentinel.textContent = 'refocus sentinel';
      sentinel.style.cssText = [
        'position:fixed',
        'left:0',
        'top:0',
        'z-index:2147483647',
        'width:32px',
        'height:32px',
      ].join(';');
      document.body.appendChild(sentinel);
    }

    sentinel.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });

  await page.locator('#huge-document-refocus-sentinel').click();

  await expect
    .poll(() => page.evaluate(() => document.activeElement?.id ?? null))
    .not.toBe('huge-document-editor');
};

const BROWSER_UNDO_HOTKEY = 'ControlOrMeta+Z';
const BROWSER_REDO_HOTKEY = 'ControlOrMeta+Shift+Z';
const BROWSER_SELECT_ALL_HOTKEY = 'ControlOrMeta+A';

const pressKeyboardWithTiming = async (
  page: Page,
  key: string,
  timeoutMs: number
) => {
  const startedAt = performance.now();

  await Promise.race([
    page.keyboard.press(key),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`${key} exceeded ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);

  return Math.round(performance.now() - startedAt);
};

const getHugeDocumentCounts = async (editor: BrowserEditorHarness) =>
  editor.root.evaluate((element: HTMLElement) => ({
    domNodeCount: Number(
      element.ownerDocument
        .querySelector('[data-test-id="huge-document-dom-node-count"]')
        ?.textContent?.replace(/,/g, '') ?? Number.NaN
    ),
    mountedTopLevelCount: Number(
      element.ownerDocument
        .querySelector('[data-test-id="huge-document-mounted-top-level-count"]')
        ?.textContent?.replace(/,/g, '') ?? Number.NaN
    ),
    pendingTopLevelCount: Number(
      element.ownerDocument
        .querySelector('[data-test-id="huge-document-pending-top-level-count"]')
        ?.textContent?.replace(/,/g, '') ?? Number.NaN
    ),
    boundaryCount: element.querySelectorAll(
      '[data-editor-viewport-boundary="true"]'
    ).length,
  }));

const getNativeSelectionSummary = async (editor: BrowserEditorHarness) =>
  (await editor.selection.displayed()).native;

const getViewSelectionSummary = async (editor: BrowserEditorHarness) =>
  (await editor.selection.displayed()).view;

const editorSelectionProof = async (editor: BrowserEditorHarness) => {
  const displayedSelection = await editor.selection.displayed();

  return {
    hasVisibleSelection: displayedSelection.hasVisibleEditorSelection,
    nativeSelection: displayedSelection.native,
    selection: displayedSelection.model,
    viewSelection: displayedSelection.view,
  };
};

const installHugeDocumentKeyboardProfiler = async (
  editor: BrowserEditorHarness
) =>
  editor.root.evaluate((element: HTMLElement) => {
    const target = element.ownerDocument
      .defaultView as HugeDocumentKeyboardProfilerWindow | null;

    if (!target) {
      throw new Error('Missing editor window for keyboard profiler');
    }

    const profiler = {
      events: [] as HugeDocumentKeyboardProfilerEvent[],
      reset() {
        this.events.length = 0;
      },
      snapshot() {
        return this.events.slice();
      },
    };

    target.__HUGE_DOCUMENT_KEYDOWN_PROFILER__ = profiler;
    target.__EDITOR_REACT_RENDER_PROFILER__ = {
      record(event: HugeDocumentKeyboardProfilerEvent) {
        profiler.events.push(event);
      },
    };
  });

const resetHugeDocumentKeyboardProfiler = async (
  editor: BrowserEditorHarness
) =>
  editor.root.evaluate((element: HTMLElement) => {
    const target = element.ownerDocument
      .defaultView as HugeDocumentKeyboardProfilerWindow | null;

    target?.__HUGE_DOCUMENT_KEYDOWN_PROFILER__?.reset();
  });

const snapshotHugeDocumentKeyboardProfiler = async (
  editor: BrowserEditorHarness
) =>
  editor.root.evaluate((element: HTMLElement) => {
    const target = element.ownerDocument
      .defaultView as HugeDocumentKeyboardProfilerWindow | null;

    return target?.__HUGE_DOCUMENT_KEYDOWN_PROFILER__?.snapshot() ?? [];
  });

const waitForTextBlockMaterialized = async (
  editor: BrowserEditorHarness,
  blockIndex: number
) =>
  editor.dom.waitForTextPath([blockIndex, 0], {
    timeoutMs: hugeDocumentReadyTimeout,
  });

const waitForEditorAnimationFrames = async (
  editor: BrowserEditorHarness,
  count = 2
) =>
  editor.root.evaluate((_element: HTMLElement, frameCount) => {
    let remaining = frameCount;

    return new Promise<void>((resolve) => {
      const tick = () => {
        remaining -= 1;

        if (remaining <= 0) {
          resolve();
          return;
        }

        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });
  }, count);

const getTextBlockText = async (
  editor: BrowserEditorHarness,
  blockIndex: number
) =>
  editor.root.evaluate((element: HTMLElement, index) => {
    const textElement = element.querySelector(
      `[data-editor-node="text"][data-editor-path="${index},0"]`
    );
    const block = textElement?.closest('[data-editor-node="element"]');

    return (block ?? textElement)?.textContent?.replace(/\uFEFF/g, '') ?? null;
  }, blockIndex);

const getVirtualizedRowStackingProof = async (
  editor: BrowserEditorHarness,
  {
    allowGaps,
    frameCount = 0,
    scrollTop,
  }: {
    allowGaps: boolean;
    frameCount?: number;
    scrollTop: number;
  }
) =>
  editor.root.evaluate(
    async (
      element: HTMLElement,
      {
        allowGaps,
        frameCount,
        scrollTop,
      }: { allowGaps: boolean; frameCount: number; scrollTop: number }
    ) => {
      element.scrollTop = scrollTop;
      element.dispatchEvent(new Event('scroll', { bubbles: true }));

      for (let index = 0; index < frameCount; index += 1) {
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        });
      }

      const rootRect = element.getBoundingClientRect();
      const rows = Array.from(
        element.querySelectorAll<HTMLElement>(
          '[data-editor-virtualized-row="true"]'
        )
      )
        .map((row) => {
          const child =
            row.querySelector<HTMLElement>('[data-editor-node="element"]') ??
            row;
          const rowRect = row.getBoundingClientRect();
          const childRect = child.getBoundingClientRect();

          return {
            bottom: Math.round(childRect.bottom - rootRect.top),
            height: Math.round(childRect.height),
            index: Number(row.dataset.index),
            rowBottom: Math.round(rowRect.bottom - rootRect.top),
            rowTop: Math.round(rowRect.top - rootRect.top),
            text: child.textContent
              ?.replace(/\uFEFF/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 80),
            top: Math.round(childRect.top - rootRect.top),
          };
        })
        .filter(
          (row) => row.bottom >= -40 && row.top <= element.clientHeight + 40
        );

      const gaps: Array<{
        gap: number;
        next: (typeof rows)[number];
        previous: (typeof rows)[number];
      }> = [];
      const overlaps: Array<{
        next: (typeof rows)[number];
        overlap: number;
        previous: (typeof rows)[number];
      }> = [];

      for (let index = 1; index < rows.length; index += 1) {
        const previous = rows[index - 1]!;
        const next = rows[index]!;

        if (next.top < previous.bottom - 2) {
          overlaps.push({
            next,
            overlap: previous.bottom - next.top,
            previous,
          });
        }

        if (!allowGaps && next.rowTop > previous.rowBottom + 4) {
          gaps.push({
            gap: next.rowTop - previous.rowBottom,
            next,
            previous,
          });
        }
      }

      return {
        gaps,
        rowCount: rows.length,
        rows,
        scrollTop: Math.round(element.scrollTop),
        overlaps,
      };
    },
    { allowGaps, frameCount, scrollTop }
  );

const getVirtualizedScrollbarDragBufferProof = async (
  editor: BrowserEditorHarness,
  scrollTop: number,
  side: 'left' | 'right' = 'right'
) =>
  editor.root.evaluate(
    (element: HTMLElement, { side, targetScrollTop }) => {
      const initialRect = element.getBoundingClientRect();
      const pointerX =
        side === 'left' ? initialRect.left + 2 : initialRect.right - 2;
      const pointerY =
        initialRect.top + Math.min(24, Math.max(1, element.clientHeight / 2));

      element.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          clientX: pointerX,
          clientY: pointerY,
          pointerId: 1,
          pointerType: 'mouse',
        })
      );
      element.scrollTop = targetScrollTop;

      const rootRect = element.getBoundingClientRect();
      const rows = Array.from(
        element.querySelectorAll<HTMLElement>(
          '[data-editor-virtualized-row="true"]'
        )
      );
      const rowRects = rows.map((row) => {
        const child =
          row.querySelector<HTMLElement>('[data-editor-node="element"]') ?? row;
        const rect = child.getBoundingClientRect();

        return {
          bottom: Math.round(rect.bottom - rootRect.top),
          index: Number(row.dataset.index),
          text: child.textContent
            ?.replace(/\uFEFF/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 80),
          top: Math.round(rect.top - rootRect.top),
        };
      });
      const visibleRows = rowRects.filter(
        (row) => row.bottom >= 0 && row.top <= element.clientHeight
      );

      element.ownerDocument.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          clientX: pointerX,
          clientY: pointerY,
          pointerId: 1,
          pointerType: 'mouse',
        })
      );

      return {
        clientHeight: element.clientHeight,
        direction:
          element.ownerDocument.defaultView?.getComputedStyle(element)
            .direction,
        mountedRowCount: rows.length,
        pointerX,
        rowRects: rowRects.slice(0, 20),
        side,
        scrollTop: Math.round(element.scrollTop),
        visibleRows,
      };
    },
    { side, targetScrollTop: scrollTop }
  );

const waitForVirtualizedScrollbarDragBufferProof = async (
  editor: BrowserEditorHarness,
  scrollTop: number,
  side: 'left' | 'right' = 'right'
) => {
  let latestProof:
    | Awaited<ReturnType<typeof getVirtualizedScrollbarDragBufferProof>>
    | undefined;

  await expect
    .poll(
      async () => {
        latestProof = await getVirtualizedScrollbarDragBufferProof(
          editor,
          scrollTop,
          side
        );

        return latestProof.visibleRows.some((row) => row.index > 10)
          ? 'ready'
          : `mounted=${latestProof.mountedRowCount};visible=${latestProof.visibleRows.length}`;
      },
      { timeout: hugeDocumentReadyTimeout }
    )
    .toBe('ready');

  return latestProof!;
};

const selectTextBlockOffsetDOM = async (
  editor: BrowserEditorHarness,
  blockIndex: number,
  offset: number
) => {
  await editor.dom.collapseAtTextPath(
    { offset, path: [blockIndex, 0] },
    { timeoutMs: hugeDocumentReadyTimeout }
  );
  await editor.assert.selection({
    anchor: { offset, path: [blockIndex, 0] },
    focus: { offset, path: [blockIndex, 0] },
  });
};

const openSmallHugeDocument = async (
  page: Parameters<typeof openExample>[0],
  query: Record<string, string | number | boolean> = {}
) =>
  openExample(page, 'plite/huge-document', {
    query: {
      blocks: 120,
      content_visibility: 'none',
      strict: 'false',
      ...query,
    },
    ready: { editor: 'visible' },
  });

test.describe('huge document example', {
  annotation: {
    description: 'heavy',
    type: 'plite-browser-profile',
  },
}, () => {
  test('renders huge document without child-count chunking', async ({
    page,
  }) => {
    await openExample(page, 'plite/huge-document', {
      ready: {
        editor: 'visible',
        timeoutMs: hugeDocumentReadyTimeout,
      },
    });
    await expect(page.getByLabel('Blocks')).toHaveValue('10000');
    await expect(page.getByRole('textbox')).toBeVisible({
      timeout: hugeDocumentReadyTimeout,
    });
    await expect(page.getByLabel('Rendering')).toHaveValue('virtualized');
    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');
    await expect
      .poll(async () =>
        Number(
          await page
            .getByTestId('huge-document-mounted-top-level-count')
            .textContent()
        )
      )
      .toBeLessThan(200);
    await expect(page.locator('[data-editor-chunk]')).toHaveCount(0);
  });

  test('keeps seeded content deterministic when block count grows', async ({
    page,
  }) => {
    const blockIndex = 100;
    const seed = 'growth-cache-contract';
    const editor = await openSmallHugeDocument(page, {
      blocks: 2,
      seed,
      rendering: 'complete',
    });

    await page.getByLabel('Blocks').selectOption('1000');
    await expect(page.getByLabel('Blocks')).toHaveValue('1000');
    await expect
      .poll(async () => (await getTextBlockText(editor, blockIndex)) ?? '', {
        timeout: hugeDocumentReadyTimeout,
      })
      .toMatch(/\S/);

    const grownText = await getTextBlockText(editor, blockIndex);

    if (!grownText) {
      throw new Error(`Missing grown text for block ${blockIndex}`);
    }

    const freshPage = await page.context().newPage();

    try {
      const freshEditor = await openSmallHugeDocument(freshPage, {
        blocks: 1000,
        seed,
        rendering: 'complete',
      });

      await expect
        .poll(
          async () => (await getTextBlockText(freshEditor, blockIndex)) ?? '',
          {
            timeout: hugeDocumentReadyTimeout,
          }
        )
        .toBe(grownText);
    } finally {
      await freshPage.close();
    }
  });

  test('exposes virtualized rendering controls and metrics', async ({
    page,
  }) => {
    await openSmallHugeDocument(page, {
      blocks: 1200,
      editor_height: 360,
      estimated_block_size: 48,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect(page.getByLabel('Rendering')).toHaveValue('virtualized');
    await expect(page.getByLabel('Editor height')).toHaveValue('360');
    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');
    await expect
      .poll(async () =>
        Number(
          await page
            .getByTestId('huge-document-viewport-boundary-count')
            .textContent()
        )
      )
      .toBeGreaterThan(0);
    await expect(
      page.locator('[data-editor-virtualized-viewport="true"]')
    ).toBeVisible();
  });

  test('keeps virtualized browser select-all delete, typing, undo, and redo bounded', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop keyboard/select-all proof for virtualized huge-document editing'
    );

    const editor = await openSmallHugeDocument(page, {
      blocks: 5000,
      editor_height: 420,
      estimated_block_size: 48,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    const beforeModelBlockTexts = await editor.get.modelBlockTexts();
    const beforeBoundary = {
      first: beforeModelBlockTexts[0],
      last: beforeModelBlockTexts.at(-1),
      length: beforeModelBlockTexts.length,
    };

    expect(beforeBoundary.length).toBe(5000);

    const selectAllMs = await pressKeyboardWithTiming(
      page,
      BROWSER_SELECT_ALL_HOTKEY,
      10_000
    );

    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: {
        path: [beforeBoundary.length - 1, 0],
        offset: beforeBoundary.last!.length,
      },
    });

    const afterSelectAllCounts = await getHugeDocumentCounts(editor);
    const afterSelectAllNative = await getNativeSelectionSummary(editor);
    const afterSelectAllView = await getViewSelectionSummary(editor);

    expect(afterSelectAllNative.textLength).toBe(0);
    expect(afterSelectAllView.active).toBe(true);
    expect(afterSelectAllView.markerCount).toBeGreaterThan(0);
    expect(afterSelectAllCounts.mountedTopLevelCount).toBeLessThan(140);
    await editor.assert.noDoubleSelectionHighlight();

    const deleteMs = await pressKeyboardWithTiming(page, 'Delete', 5000);

    await expect
      .poll(async () => ({
        selection: await editor.selection.get(),
        texts: await editor.get.modelBlockTexts(),
      }))
      .toEqual({
        selection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        texts: [''],
      });

    const typeText = 'after virtualized delete';

    await page.keyboard.type(typeText, { delay: 0 });

    await expect
      .poll(async () => ({
        selection: await editor.selection.get(),
        texts: await editor.get.modelBlockTexts(),
      }))
      .toEqual({
        selection: {
          anchor: { path: [0, 0], offset: typeText.length },
          focus: { path: [0, 0], offset: typeText.length },
        },
        texts: [typeText],
      });

    const undoHotkey = BROWSER_UNDO_HOTKEY;
    const redoHotkey = BROWSER_REDO_HOTKEY;

    await page.keyboard.press(undoHotkey);

    await expect.poll(() => editor.get.modelBlockTexts()).toEqual(['']);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });

    await page.keyboard.press(redoHotkey);

    await expect.poll(() => editor.get.modelBlockTexts()).toEqual([typeText]);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: typeText.length },
      focus: { path: [0, 0], offset: typeText.length },
    });

    await page.keyboard.press(undoHotkey);
    await expect.poll(() => editor.get.modelBlockTexts()).toEqual(['']);

    const undoDeleteMs = await pressKeyboardWithTiming(
      page,
      undoHotkey,
      15_000
    );

    await expect
      .poll(async () => {
        const nextModelBlockTexts = await editor.get.modelBlockTexts();

        return {
          first: nextModelBlockTexts[0],
          last: nextModelBlockTexts.at(-1),
          length: nextModelBlockTexts.length,
          selection: await editor.selection.get(),
        };
      })
      .toEqual({
        ...beforeBoundary,
        selection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: {
            path: [beforeBoundary.length - 1, 0],
            offset: beforeBoundary.last!.length,
          },
        },
      });

    await page.keyboard.press(redoHotkey);

    await expect
      .poll(async () => ({
        selection: await editor.selection.get(),
        texts: await editor.get.modelBlockTexts(),
      }))
      .toEqual({
        selection: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 0 },
        },
        texts: [''],
      });

    await attachBrowserJsonArtifact(
      testInfo,
      'virtualized-select-all-delete-redo-proof',
      {
        afterSelectAllCounts,
        afterSelectAllNative,
        afterSelectAllView,
        deleteMs,
        selectAllMs,
        undoDeleteMs,
      }
    );

    expect(deleteMs).toBeLessThan(5000);
    expect(undoDeleteMs).toBeLessThan(15_000);
  });

  test('replaces a huge select-all range with pasted text and undo restores it', async ({
    page,
  }) => {
    const editor = await openSmallHugeDocument(page, {
      blocks: 300,
      rendering: 'complete',
    });
    const beforeBlockTexts = await editor.get.blockTexts();

    expect(beforeBlockTexts.length).toBe(300);

    await editor.selection.selectAll();
    await expect.poll(() => editor.get.selectedText()).not.toBe('');

    await editor.clipboard.pasteText('huge paste replacement');

    await expect
      .poll(() => editor.get.blockTexts())
      .toEqual(['huge paste replacement']);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 'huge paste replacement'.length },
      focus: { path: [0, 0], offset: 'huge paste replacement'.length },
    });

    await editor.undo();

    await expect.poll(() => editor.get.blockTexts()).toEqual(beforeBlockTexts);
    await editor.assert.selection({
      anchor: { path: [0, 0], offset: 0 },
      focus: {
        path: [beforeBlockTexts.length - 1, 0],
        offset: beforeBlockTexts.at(-1)!.length,
      },
    });
  });

  test('keeps virtualized 5k typing, undo, arrows, Enter, and scroll stable', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop typing perf proof');

    const blockIndex = 2500;
    const offset = 1;
    const typeText = 'X'.repeat(10);
    const editor = await openSmallHugeDocument(page, {
      blocks: 5000,
      editor_height: 600,
      estimated_block_size: 48,
      overscan: 2,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    await selectTextBlockOffsetDOM(editor, blockIndex, offset);
    const beforeText = await getTextBlockText(editor, blockIndex);

    if (!beforeText) {
      throw new Error(`Missing text for block ${blockIndex}`);
    }

    const expectedText =
      beforeText.slice(0, offset) + typeText + beforeText.slice(offset);

    await page.keyboard.type(typeText);

    await expect
      .poll(() => getTextBlockText(editor, blockIndex))
      .toBe(expectedText);
    await editor.assert.collapsedModelDOMSelection({
      offset: [offset + typeText.length - 1, offset + typeText.length],
      path: [blockIndex, 0],
      text: expectedText,
    });
    const afterTypeSelection = await editor.selection.get();
    const afterTypeOffset = afterTypeSelection!.anchor.offset;
    await editor.assert.caretVisibleInScrollableParent();

    await page.keyboard.press('ArrowLeft');
    await editor.assert.collapsedModelDOMSelection({
      offset: afterTypeOffset - 1,
      path: [blockIndex, 0],
      text: expectedText,
    });

    await page.keyboard.press('ArrowRight');
    await editor.assert.collapsedModelDOMSelection({
      offset: afterTypeOffset,
      path: [blockIndex, 0],
      text: expectedText,
    });

    await page.keyboard.press(BROWSER_UNDO_HOTKEY);

    await expect
      .poll(() => getTextBlockText(editor, blockIndex))
      .toBe(beforeText);
    await editor.assert.collapsedModelDOMSelection({
      offset: [offset, offset + 1],
      path: [blockIndex, 0],
      text: beforeText,
    });
    await editor.assert.caretVisibleInScrollableParent();

    const firstText = 'abc';
    const secondText = 'def';
    const expectedFirstBlock = beforeText.slice(0, offset) + firstText;
    const expectedSecondBlock = secondText + beforeText.slice(offset);

    await selectTextBlockOffsetDOM(editor, blockIndex, offset);
    await page.keyboard.type(`${firstText}\n${secondText}`, { delay: 0 });
    await waitForTextBlockMaterialized(editor, blockIndex + 1);

    await expect
      .poll(async () => ({
        firstBlock: await getTextBlockText(editor, blockIndex),
        secondBlock: await getTextBlockText(editor, blockIndex + 1),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        firstBlock: expectedFirstBlock,
        secondBlock: expectedSecondBlock,
        selection: {
          anchor: { offset: secondText.length, path: [blockIndex + 1, 0] },
          focus: { offset: secondText.length, path: [blockIndex + 1, 0] },
        },
      });
    await editor.assert.caretVisibleInScrollableParent();
  });

  test('keeps virtualized overscan-zero middle-block burst typing at the native caret', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop proof for virtualized overscan-zero burst typing'
    );

    const blockIndex = 2500;
    const offset = 1;
    const typeText = 'X'.repeat(10);
    const editor = await openSmallHugeDocument(page, {
      blocks: 5000,
      editor_height: 600,
      estimated_block_size: 24,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    await selectTextBlockOffsetDOM(editor, blockIndex, offset);
    const beforeText = await getTextBlockText(editor, blockIndex);

    if (!beforeText) {
      throw new Error(`Missing text for block ${blockIndex}`);
    }

    const expectedText =
      beforeText.slice(0, offset) + typeText + beforeText.slice(offset);

    await page.keyboard.type(typeText, { delay: 0 });

    await expect
      .poll(() => getTextBlockText(editor, blockIndex))
      .toBe(expectedText);
    await editor.dom.waitForPendingNativeTextInputRepair({
      timeoutMs: hugeDocumentReadyTimeout,
    });
    await editor.assert.collapsedModelDOMSelection({
      offset: offset + typeText.length,
      path: [blockIndex, 0],
      text: expectedText,
    });
  });

  test('keeps virtualized repeated Shift+ArrowDown and Shift+ArrowUp aligned with complete and bounded', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop keyboard/perf proof for virtualized huge-document vertical selection'
    );

    const collectShiftDownProof = async (
      rendering: 'complete' | 'virtualized'
    ) => {
      const editor = await openSmallHugeDocument(page, {
        blocks: 5000,
        editor_height: 420,
        estimated_block_size: 48,
        overscan: 0,
        rendering,
      });

      await expect
        .poll(() =>
          page.getByTestId('huge-document-rendering-mode').textContent()
        )
        .toBe(rendering);

      const firstBlockGeometry = await editor.root.evaluate(
        (element: HTMLElement) => {
          const firstBlock = element.querySelector<HTMLElement>(
            '[data-editor-node="element"]'
          );
          const rootRect = element.getBoundingClientRect();
          const firstBlockRect = firstBlock?.getBoundingClientRect();

          return {
            firstLeft: Math.round(firstBlockRect?.left ?? Number.NaN),
            firstWidth: Math.round(firstBlockRect?.width ?? Number.NaN),
            rootLeft: Math.round(rootRect.left),
            rootPaddingLeft:
              element.ownerDocument.defaultView?.getComputedStyle(element)
                .paddingLeft ?? null,
            rootWidth: Math.round(rootRect.width),
          };
        }
      );

      await selectTextBlockOffsetDOM(editor, 0, 37);
      await installHugeDocumentKeyboardProfiler(editor);
      const keypressTimeoutMs =
        rendering === 'virtualized' ? 400 : hugeDocumentReadyTimeout;
      const readFocusKey = async () => {
        const selection = await editor.selection.get();

        return selection
          ? `${selection.focus.path.join(',')}:${selection.focus.offset}`
          : null;
      };
      let previousFocusKey = await readFocusKey();

      const keyMs: number[] = [];
      const downSnapshots: Array<{
        focusKey: string | null;
        focusPath: number[] | null;
        markerCount: number;
        markerPaths: Array<string | null>;
        modelLineFallbackCount: number;
        mountedTopLevelCount: string | null;
        nativeTextLength: number;
        step: number;
      }> = [];
      const upSnapshots: Array<{
        focusKey: string | null;
        markerCount: number;
        markerPaths: Array<string | null>;
        modelLineFallbackCount: number;
        mountedTopLevelCount: string | null;
        nativeTextLength: number;
        step: number;
      }> = [];
      let previousFocusIndex = 0;
      let afterDownNative: Awaited<
        ReturnType<typeof getNativeSelectionSummary>
      > | null = null;
      let afterDownSelection: Awaited<
        ReturnType<typeof editor.selection.get>
      > | null = null;
      let afterDownViewSelection: Awaited<
        ReturnType<typeof getViewSelectionSummary>
      > | null = null;

      await page.keyboard.down('Shift');
      try {
        for (let index = 0; index < 24; index += 1) {
          await resetHugeDocumentKeyboardProfiler(editor);

          keyMs.push(
            await pressKeyboardWithTiming(
              page,
              'ArrowDown',
              keypressTimeoutMs
            )
          );
          await expect.poll(readFocusKey).not.toBe(previousFocusKey);

          const selection = await editor.selection.get();
          previousFocusKey = selection
            ? `${selection.focus.path.join(',')}:${selection.focus.offset}`
            : null;
          const viewSelection = await getViewSelectionSummary(editor);
          const nativeSelection = await getNativeSelectionSummary(editor);
          const profilerEvents =
            await snapshotHugeDocumentKeyboardProfiler(editor);
          const modelLineFallbackEvents = profilerEvents.filter(
            (event) =>
              event.kind === 'runtime-time' &&
              event.id === 'plain-vertical.resolve-model-line-target'
          );
          const focusIndex = selection?.focus.path[0];

          expect(modelLineFallbackEvents).toHaveLength(0);

          if (typeof focusIndex === 'number') {
            expect(focusIndex).toBeGreaterThanOrEqual(previousFocusIndex);
            previousFocusIndex = focusIndex;
          }

          if (
            selection &&
            (selection.anchor.offset !== selection.focus.offset ||
              selection.anchor.path.join(',') !==
                selection.focus.path.join(','))
          ) {
            if (rendering === 'virtualized') {
              expect(viewSelection.active).toBe(true);
              expect(viewSelection.markerCount).toBeGreaterThan(0);
              expect(nativeSelection.textLength).toBe(0);
            } else {
              expect(viewSelection.active).toBe(false);
              expect(viewSelection.markerCount).toBe(0);
              expect(nativeSelection.textLength).toBeGreaterThan(0);
            }
          }

          downSnapshots.push({
            focusKey: selection
              ? `${selection.focus.path.join(',')}:${selection.focus.offset}`
              : null,
            focusPath: selection?.focus.path ?? null,
            markerCount: viewSelection.markerCount,
            markerPaths: viewSelection.markerPaths,
            modelLineFallbackCount: modelLineFallbackEvents.length,
            mountedTopLevelCount: await page
              .getByTestId('huge-document-mounted-top-level-count')
              .textContent(),
            nativeTextLength: nativeSelection.textLength,
            step: index,
          });
        }

        afterDownSelection = await editor.selection.get();
        afterDownNative = await getNativeSelectionSummary(editor);
        afterDownViewSelection = await getViewSelectionSummary(editor);

        expect(afterDownSelection?.anchor).toEqual({
          offset: 37,
          path: [0, 0],
        });
        expect(afterDownSelection?.focus.path[0]).toBeGreaterThan(0);
        if (rendering === 'virtualized') {
          expect(afterDownViewSelection.active).toBe(true);
          expect(afterDownViewSelection.markerCount).toBeGreaterThan(1);
          expect(afterDownViewSelection.markerPaths).toContain(
            afterDownSelection!.focus.path.join(',')
          );
          expect(afterDownViewSelection.markerRects).toHaveLength(
            afterDownViewSelection.markerCount
          );
          expect(
            afterDownViewSelection.markerRects.some(
              (rect) => rect.width > 0 && rect.height > 0
            )
          ).toBe(true);
          expect(afterDownNative.textLength).toBe(0);
        } else {
          expect(afterDownViewSelection.active).toBe(false);
          expect(afterDownViewSelection.markerCount).toBe(0);
          expect(afterDownNative.textLength).toBeGreaterThan(0);
        }
        await editor.assert.noDoubleSelectionHighlight();
        await attachBrowserSelectionScreenshot(
          editor,
          testInfo,
          `${rendering}-repeated-shift-down-projected-selection.png`
        );

        for (let index = 0; index < 12; index += 1) {
          await resetHugeDocumentKeyboardProfiler(editor);

          keyMs.push(
            await pressKeyboardWithTiming(page, 'ArrowUp', keypressTimeoutMs)
          );
          await expect.poll(readFocusKey).not.toBe(previousFocusKey);

          const selection = await editor.selection.get();
          previousFocusKey = selection
            ? `${selection.focus.path.join(',')}:${selection.focus.offset}`
            : null;
          const viewSelection = await getViewSelectionSummary(editor);
          const nativeSelection = await getNativeSelectionSummary(editor);
          const profilerEvents =
            await snapshotHugeDocumentKeyboardProfiler(editor);
          const modelLineFallbackEvents = profilerEvents.filter(
            (event) =>
              event.kind === 'runtime-time' &&
              event.id === 'plain-vertical.resolve-model-line-target'
          );

          expect(modelLineFallbackEvents).toHaveLength(0);

          if (
            selection &&
            (selection.anchor.offset !== selection.focus.offset ||
              selection.anchor.path.join(',') !==
                selection.focus.path.join(','))
          ) {
            if (rendering === 'virtualized') {
              expect(viewSelection.active).toBe(true);
              expect(viewSelection.markerCount).toBeGreaterThan(0);
              expect(nativeSelection.textLength).toBe(0);
            } else {
              expect(viewSelection.active).toBe(false);
              expect(viewSelection.markerCount).toBe(0);
              expect(nativeSelection.textLength).toBeGreaterThan(0);
            }
          }

          upSnapshots.push({
            focusKey: selection
              ? `${selection.focus.path.join(',')}:${selection.focus.offset}`
              : null,
            markerCount: viewSelection.markerCount,
            markerPaths: viewSelection.markerPaths,
            modelLineFallbackCount: modelLineFallbackEvents.length,
            mountedTopLevelCount: await page
              .getByTestId('huge-document-mounted-top-level-count')
              .textContent(),
            nativeTextLength: nativeSelection.textLength,
            step: index,
          });
        }
      } finally {
        await page.keyboard.up('Shift');
      }

      if (!afterDownNative || !afterDownSelection || !afterDownViewSelection) {
        throw new Error('Missing Shift+ArrowDown proof snapshot');
      }

      const focusSteps = downSnapshots.map((snapshot) => snapshot.focusKey);
      const upFocusSteps = upSnapshots.map((snapshot) => snapshot.focusKey);
      const expectedUpFocusSteps = focusSteps
        .slice(
          Math.max(0, focusSteps.length - 1 - upFocusSteps.length),
          focusSteps.length - 1
        )
        .reverse();

      return {
        afterDownNative,
        afterDownSelection,
        afterDownViewSelection,
        downSnapshots,
        expectedUpFocusSteps,
        firstBlockGeometry,
        focusSteps,
        keyMs,
        upFocusSteps,
        upSnapshots,
      };
    };

    const completeProof = await collectShiftDownProof('complete');
    const virtualizedProof = await collectShiftDownProof('virtualized');
    const expectFocusStepsAligned = (
      actual: Array<string | null>,
      expected: Array<string | null>
    ) => {
      expect(actual).toHaveLength(expected.length);

      actual.forEach((actualKey, index) => {
        const expectedKey = expected[index];

        if (actualKey === null || expectedKey === null) {
          expect(actualKey).toBe(expectedKey);
          return;
        }

        const actualSeparator = actualKey.lastIndexOf(':');
        const expectedSeparator = expectedKey.lastIndexOf(':');

        expect(actualKey.slice(0, actualSeparator)).toBe(
          expectedKey.slice(0, expectedSeparator)
        );
        expect(
          Math.abs(
            Number(actualKey.slice(actualSeparator + 1)) -
              Number(expectedKey.slice(expectedSeparator + 1))
          )
        ).toBeLessThanOrEqual(1);
      });
    };

    expect(virtualizedProof.firstBlockGeometry).toEqual(
      completeProof.firstBlockGeometry
    );
    expectFocusStepsAligned(
      virtualizedProof.focusSteps,
      completeProof.focusSteps
    );
    expectFocusStepsAligned(
      virtualizedProof.upFocusSteps,
      completeProof.upFocusSteps
    );

    await attachBrowserJsonArtifact(
      testInfo,
      'virtualized-repeated-vertical-selection-proof',
      {
        completeProof,
        virtualizedProof,
      }
    );

    expect(Math.max(...virtualizedProof.keyMs)).toBeLessThan(400);
  });

  test('keeps virtualized middle-block typing after an earlier visible edit', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'Desktop typing perf proof');

    const startBlockIndex = 0;
    const middleBlockIndex = 2500;
    const nearbyBlockIndex = 2494;
    const offset = 1;
    const typeText = 'X'.repeat(10);
    const editor = await openSmallHugeDocument(page, {
      blocks: 5000,
      editor_height: 600,
      estimated_block_size: 48,
      overscan: 2,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    const beforeModelBlockTexts = await editor.get.modelBlockTexts();
    const beforeStartText = beforeModelBlockTexts[startBlockIndex];
    const beforeMiddleText = beforeModelBlockTexts[middleBlockIndex];
    const beforeNearbyText = beforeModelBlockTexts[nearbyBlockIndex];

    if (!beforeStartText || !beforeMiddleText || !beforeNearbyText) {
      throw new Error('Missing huge-document virtualized typing baseline');
    }

    const expectedStartText =
      beforeStartText.slice(0, offset) +
      typeText +
      beforeStartText.slice(offset);
    const expectedMiddleText =
      beforeMiddleText.slice(0, offset) +
      typeText +
      beforeMiddleText.slice(offset);

    await selectTextBlockOffsetDOM(editor, startBlockIndex, offset);
    await page.keyboard.type(typeText, { delay: 0 });

    await expect
      .poll(async () => (await editor.get.modelBlockTexts())[startBlockIndex])
      .toBe(expectedStartText);

    await selectTextBlockOffsetDOM(editor, middleBlockIndex, offset);
    await page.keyboard.type(typeText, { delay: 0 });

    await expect
      .poll(async () => {
        const blockTexts = await editor.get.modelBlockTexts();

        return {
          middle: blockTexts[middleBlockIndex],
          nearby: blockTexts[nearbyBlockIndex],
          selection: await editor.selection.get(),
        };
      })
      .toEqual({
        middle: expectedMiddleText,
        nearby: beforeNearbyText,
        selection: {
          anchor: {
            offset: offset + typeText.length,
            path: [middleBlockIndex, 0],
          },
          focus: {
            offset: offset + typeText.length,
            path: [middleBlockIndex, 0],
          },
        },
      });
  });

  test('keeps virtualized middle-block materialization at 20k blocks', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop proof for large virtualized materialization'
    );

    const blockIndex = 10_000;
    const offset = 1;
    const splitText = 'tail20k';
    const typeText = 'Z';
    const editor = await openSmallHugeDocument(page, {
      blocks: 20_000,
      editor_height: 600,
      estimated_block_size: 48,
      overscan: 2,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    await selectTextBlockOffsetDOM(editor, blockIndex, offset);
    const beforeText = await getTextBlockText(editor, blockIndex);

    if (!beforeText) {
      throw new Error(`Missing text for block ${blockIndex}`);
    }

    const expectedText =
      beforeText.slice(0, offset) + typeText + beforeText.slice(offset);

    await page.keyboard.type(typeText, { delay: 0 });

    await expect
      .poll(async () => ({
        selection: await editor.selection.get(),
        text: await editor.get.modelBlockText(blockIndex),
      }))
      .toEqual({
        selection: {
          anchor: { offset: offset + typeText.length, path: [blockIndex, 0] },
          focus: { offset: offset + typeText.length, path: [blockIndex, 0] },
        },
        text: expectedText,
      });
    await editor.assert.caretVisibleInScrollableParent();

    const splitOffset = offset + typeText.length;
    const expectedFirstBlock = expectedText.slice(0, splitOffset);
    const expectedSecondBlock = splitText + expectedText.slice(splitOffset);

    await page.keyboard.press('Enter');
    await page.keyboard.type(splitText, { delay: 0 });
    await waitForTextBlockMaterialized(editor, blockIndex + 1);

    await expect
      .poll(async () => ({
        firstBlock: await editor.get.modelBlockText(blockIndex),
        secondBlock: await editor.get.modelBlockText(blockIndex + 1),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        firstBlock: expectedFirstBlock,
        secondBlock: expectedSecondBlock,
        selection: {
          anchor: { offset: splitText.length, path: [blockIndex + 1, 0] },
          focus: { offset: splitText.length, path: [blockIndex + 1, 0] },
        },
      });
    await editor.assert.caretVisibleInScrollableParent();
  });

  test('keeps virtualized insert-break bursts split at the live caret', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop virtualized insert-break burst proof'
    );

    const blockIndex = 0;
    const offset = 4;
    const firstText = 'abc';
    const secondText = 'def';

    const editor = await openSmallHugeDocument(page, {
      blocks: 10_000,
      content_visibility: 'element',
      editor_height: 420,
      estimated_block_size: 48,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    await selectTextBlockOffsetDOM(editor, blockIndex, offset);
    const beforeText = await getTextBlockText(editor, blockIndex);

    if (!beforeText) {
      throw new Error(`Missing text for block ${blockIndex}`);
    }

    const expectedFirstBlock = beforeText.slice(0, offset) + firstText;
    const expectedSecondBlock = secondText + beforeText.slice(offset);

    await page.keyboard.type(firstText, { delay: 0 });
    await page.keyboard.press('Enter');
    await page.keyboard.type(secondText, { delay: 0 });
    await waitForTextBlockMaterialized(editor, blockIndex + 1);

    await expect
      .poll(async () => ({
        firstBlock: await getTextBlockText(editor, blockIndex),
        secondBlock: await getTextBlockText(editor, blockIndex + 1),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        firstBlock: expectedFirstBlock,
        secondBlock: expectedSecondBlock,
        selection: {
          anchor: { offset: secondText.length, path: [blockIndex + 1, 0] },
          focus: { offset: secondText.length, path: [blockIndex + 1, 0] },
        },
      });

    await attachBrowserJsonArtifact(
      testInfo,
      'huge-document-insert-break-burst-proof',
      {
        expectedFirstBlock,
        expectedSecondBlock,
        offset,
      }
    );
  });

  test('keeps virtualized backward scroll stable over dynamic block heights', async ({
    page,
  }) => {
    const editor = await openSmallHugeDocument(page, {
      blocks: 1200,
      editor_height: 260,
      estimated_block_size: 24,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    const proof = await editor.root.evaluate(async (element: HTMLElement) => {
      const nextFrame = () =>
        new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const getRowHeights = () =>
        Array.from(
          element.querySelectorAll<HTMLElement>(
            '[data-editor-virtualized-row="true"]'
          )
        )
          .map((row) => Math.round(row.getBoundingClientRect().height))
          .filter((height) => height > 0);

      await nextFrame();
      await nextFrame();

      element.scrollTop = 4800;
      element.dispatchEvent(new Event('scroll', { bubbles: true }));

      await nextFrame();
      await nextFrame();

      const before = element.scrollTop;
      const target = Math.max(0, before - 360);
      const heightsBefore = getRowHeights();

      element.scrollTop = target;
      element.dispatchEvent(new Event('scroll', { bubbles: true }));

      await nextFrame();
      await nextFrame();

      const after = element.scrollTop;
      const heightsAfter = getRowHeights();
      const heightSpread =
        Math.max(...heightsBefore, ...heightsAfter) -
        Math.min(...heightsBefore, ...heightsAfter);

      return {
        after,
        before,
        heightSpread,
        target,
      };
    });

    expect(proof.before).toBeGreaterThan(0);
    expect(proof.heightSpread).toBeGreaterThan(1);
    expect(proof.after).toBeGreaterThanOrEqual(proof.target - 16);
    expect(proof.after).toBeLessThanOrEqual(proof.target + 80);
  });

  test('keeps virtualized rows visually coherent during internal scrollbar jumps', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop proof for virtualized internal-scrollbar row stacking'
    );

    const editor = await openSmallHugeDocument(page, {
      blocks: 10_000,
      content_visibility: 'none',
      editor_height: 420,
      estimated_block_size: 48,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');
    await editor.root.scrollIntoViewIfNeeded();
    await waitForEditorAnimationFrames(editor, 2);

    const scrollTops = [
      4000, 8000, 12_000, 24_000, 48_000, 96_000, 240_000, 120_000, 60_000,
      30_000, 15_000, 7500,
    ];
    const proofs: Array<{
      immediate: Awaited<ReturnType<typeof getVirtualizedRowStackingProof>>;
      settled: Awaited<ReturnType<typeof getVirtualizedRowStackingProof>>;
      targetScrollTop: number;
    }> = [];

    for (const scrollTop of scrollTops) {
      const immediate = await getVirtualizedRowStackingProof(editor, {
        allowGaps: true,
        scrollTop,
      });

      expect(immediate.rowCount).toBeGreaterThan(0);
      expect(immediate.overlaps).toEqual([]);

      const settled = await getVirtualizedRowStackingProof(editor, {
        allowGaps: false,
        frameCount: 8,
        scrollTop,
      });

      expect(settled.rowCount).toBeGreaterThan(0);
      expect(settled.overlaps).toEqual([]);
      expect(settled.gaps).toEqual([]);

      proofs.push({ immediate, settled, targetScrollTop: scrollTop });
    }

    await attachBrowserJsonArtifact(
      testInfo,
      'virtualized-scrollbar-row-stacking-proof',
      proofs
    );
  });

  test('keeps virtualized rows buffered during native scrollbar drag before React repaint', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop proof for native-scrollbar virtualized drag buffering'
    );

    const editor = await openSmallHugeDocument(page, {
      blocks: 10_000,
      content_visibility: 'none',
      editor_height: 420,
      estimated_block_size: 48,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');
    await editor.root.scrollIntoViewIfNeeded();
    await selectTextBlockOffsetDOM(editor, 0, 10);

    const proof = await waitForVirtualizedScrollbarDragBufferProof(
      editor,
      4000
    );

    expect(proof.mountedRowCount).toBeGreaterThan(0);
    expect(proof.visibleRows.length).toBeGreaterThan(0);
    expect(proof.visibleRows.some((row) => row.index > 10)).toBe(true);

    await page.addStyleTag({
      content: '#huge-document-editor { direction: rtl; }',
    });
    await expect
      .poll(() =>
        editor.root.evaluate(
          (element: HTMLElement) =>
            element.ownerDocument.defaultView?.getComputedStyle(element)
              .direction
        )
      )
      .toBe('rtl');
    await waitForEditorAnimationFrames(editor, 2);
    const leftProof = await waitForVirtualizedScrollbarDragBufferProof(
      editor,
      4000,
      'left'
    );

    await attachBrowserJsonArtifact(
      testInfo,
      'virtualized-scrollbar-drag-buffer-proof',
      { leftProof, proof }
    );

    expect(leftProof.mountedRowCount).toBeGreaterThan(0);
    expect(leftProof.visibleRows.length).toBeGreaterThan(0);
    expect(leftProof.visibleRows.some((row) => row.index > 10)).toBe(true);
  });

  test('keeps downward drag selection autoscroll from reversing in virtualized mode', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop proof for drag-selection autoscroll direction'
    );
    test.skip(
      testInfo.project.name === 'firefox',
      'Firefox Playwright mouse drag does not start native text selection in this virtualized autoscroll scenario'
    );

    await page.setViewportSize({ height: 900, width: 900 });

    const editor = await openSmallHugeDocument(page, {
      blocks: 1000,
      editor_height: 420,
      estimated_block_size: 48,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    await editor.root.scrollIntoViewIfNeeded();

    const target = await editor.root.evaluate((element: HTMLElement) => {
      element.scrollTop = 0;

      const string = element.querySelector<HTMLElement>('[data-editor-string]');

      if (!string) {
        throw new Error('Missing initial huge-document text target');
      }

      const rootRect = element.getBoundingClientRect();
      const rect = string.getBoundingClientRect();

      return {
        edge: {
          x: rect.left + Math.min(240, rect.width - 4),
          y: rootRect.bottom - 6,
        },
        start: {
          x: rect.left + Math.min(80, rect.width / 2),
          y: rect.top + Math.min(14, rect.height / 2),
        },
      };
    });

    await page.mouse.move(target.start.x, target.start.y);
    await page.mouse.down();
    await page.mouse.move(target.edge.x, target.edge.y, { steps: 24 });

    const samples: Array<{
      collapsed: boolean | null;
      focusPath: number[] | null;
      modelExpanded: boolean;
      scrollTop: number;
      selectedLength: number;
      viewSelectionCount: number;
    }> = [];

    for (let index = 0; index < 30; index++) {
      await page.waitForTimeout(16);
      samples.push(
        await editor.root.evaluate((element: HTMLElement) => {
          const selection = element.ownerDocument.getSelection();
          const modelSelection =
            (
              element as PliteBrowserHandleElement
            ).__pliteBrowserHandle?.getSelection?.() ?? null;
          const modelExpanded = modelSelection
            ? modelSelection.anchor.offset !== modelSelection.focus.offset ||
              modelSelection.anchor.path.join(',') !==
                modelSelection.focus.path.join(',')
            : false;

          return {
            collapsed: selection?.isCollapsed ?? null,
            focusPath: modelSelection?.focus.path ?? null,
            modelExpanded,
            scrollTop: Math.round(element.scrollTop),
            selectedLength: selection?.toString().length ?? 0,
            viewSelectionCount: element.querySelectorAll(
              '[data-editor-view-selection="true"]'
            ).length,
          };
        })
      );
    }

    await page.mouse.up();

    const scrollTops = samples.map((sample) => sample.scrollTop);
    const focusBlockIndexes = samples
      .map((sample) => sample.focusPath?.[0])
      .filter((index): index is number => typeof index === 'number');
    const maxBackwardScrollStep = scrollTops.reduce((maxStep, scrollTop, i) => {
      const nextScrollTop = scrollTops[i + 1];

      return nextScrollTop === undefined
        ? maxStep
        : Math.max(maxStep, scrollTop - nextScrollTop);
    }, 0);
    const maxFocusBlockIndex = Math.max(...focusBlockIndexes);
    const focusRegressedToStart = focusBlockIndexes.some(
      (blockIndex, index) =>
        index > 0 &&
        Math.max(...focusBlockIndexes.slice(0, index)) >= 2 &&
        blockIndex === 0
    );

    await attachBrowserJsonArtifact(
      testInfo,
      'huge-document-downward-drag-autoscroll',
      {
        focusBlockIndexes,
        maxBackwardScrollStep,
        samples,
        scrollTops,
      }
    );

    expect(Math.max(...scrollTops)).toBeGreaterThan(24);
    expect(maxBackwardScrollStep).toBeLessThanOrEqual(4);
    expect(maxFocusBlockIndex).toBeGreaterThanOrEqual(2);
    expect(focusRegressedToStart).toBe(false);
    expect(
      samples.some(
        (sample) =>
          sample.selectedLength > 0 ||
          sample.viewSelectionCount > 0 ||
          sample.modelExpanded
      )
    ).toBe(true);
    expect(
      samples.every(
        (sample) =>
          sample.collapsed === false ||
          sample.viewSelectionCount > 0 ||
          sample.modelExpanded
      )
    ).toBe(true);
  });

  test('keeps blank-gap drag selection from regressing into the document start', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile' || testInfo.project.name === 'firefox',
      'Chromium/WebKit blank-gap drag proof; Firefox does not create native selection for this virtualized gap gesture'
    );

    await page.setViewportSize({ height: 700, width: 900 });

    const editor = await openSmallHugeDocument(page, {
      blocks: 1000,
      editor_height: 420,
      overscan: 0,
      rendering: 'virtualized',
    });

    await expect
      .poll(() =>
        page.getByTestId('huge-document-rendering-mode').textContent()
      )
      .toBe('virtualized');

    await page.getByRole('button', { name: 'Configuration' }).click();
    await page.getByRole('button', { name: 'Statistics' }).click();
    await editor.root.scrollIntoViewIfNeeded();

    const target = await editor.root.evaluate((element: HTMLElement) => {
      element.scrollTop = 0;

      const heading = element.querySelector<HTMLElement>(
        '[data-editor-node="text"][data-editor-path="0,0"]'
      );
      const firstParagraph = element.querySelector<HTMLElement>(
        '[data-editor-node="text"][data-editor-path="1,0"]'
      );
      const secondParagraph = element.querySelector<HTMLElement>(
        '[data-editor-node="text"][data-editor-path="2,0"]'
      );
      const thirdBlock = element.querySelector<HTMLElement>(
        '[data-editor-node="element"][data-editor-path="3"]'
      );

      if (!heading || !firstParagraph || !secondParagraph || !thirdBlock) {
        throw new Error('Missing huge-document blank-gap drag targets');
      }

      const firstRect = firstParagraph.getBoundingClientRect();
      const secondRect = secondParagraph.getBoundingClientRect();
      const thirdRect = thirdBlock.getBoundingClientRect();

      return {
        gap: {
          x: secondRect.left + Math.min(250, secondRect.width - 8),
          y: (secondRect.bottom + thirdRect.top) / 2,
        },
        headingText: heading.textContent?.replace(/\uFEFF/g, '') ?? '',
        insideSecond: {
          x: secondRect.left + Math.min(250, secondRect.width - 8),
          y: secondRect.top + Math.min(20, secondRect.height / 2),
        },
        start: {
          x: firstRect.left + Math.min(80, firstRect.width - 8),
          y: firstRect.top + Math.min(12, firstRect.height / 2),
        },
      };
    });

    await page.mouse.move(target.start.x, target.start.y);
    await page.mouse.down();

    const points = [
      ...Array.from({ length: 8 }, (_, index) => ({
        x:
          target.start.x +
          (target.insideSecond.x - target.start.x) * ((index + 1) / 8),
        y:
          target.start.y +
          (target.insideSecond.y - target.start.y) * ((index + 1) / 8),
      })),
      ...Array.from({ length: 8 }, (_, index) => ({
        x:
          target.insideSecond.x +
          (target.gap.x - target.insideSecond.x) * ((index + 1) / 8),
        y:
          target.insideSecond.y +
          (target.gap.y - target.insideSecond.y) * ((index + 1) / 8),
      })),
    ];
    const samples: Array<{
      focusPath: number[] | null;
      minSelectedBlockIndex: number | null;
      nativeIncludesHeading: boolean;
      nativeLength: number;
      viewSelectionCount: number;
    }> = [];

    for (const point of points) {
      await page.mouse.move(point.x, point.y);
      await page.waitForTimeout(20);
      samples.push(
        await editor.root.evaluate(
          (
            element: HTMLElement,
            headingText: string
          ): {
            focusPath: number[] | null;
            minSelectedBlockIndex: number | null;
            nativeIncludesHeading: boolean;
            nativeLength: number;
            viewSelectionCount: number;
          } => {
            const selection = element.ownerDocument.getSelection();
            const modelSelection =
              (
                element as PliteBrowserHandleElement
              ).__pliteBrowserHandle?.getSelection?.() ?? null;
            const selectedBlockIndexes = modelSelection
              ? [
                  modelSelection.anchor.path[0],
                  modelSelection.focus.path[0],
                ].filter((index): index is number => typeof index === 'number')
              : [];
            const nativeText = selection?.toString() ?? '';

            return {
              focusPath: modelSelection?.focus.path ?? null,
              minSelectedBlockIndex:
                selectedBlockIndexes.length === 0
                  ? null
                  : Math.min(...selectedBlockIndexes),
              nativeIncludesHeading:
                headingText.length > 0 && nativeText.includes(headingText),
              nativeLength: nativeText.length,
              viewSelectionCount: element.querySelectorAll(
                '[data-editor-view-selection="true"]'
              ).length,
            };
          },
          target.headingText
        )
      );
    }

    await page.mouse.up();

    await attachBrowserJsonArtifact(
      testInfo,
      'huge-document-blank-gap-drag-selection',
      { samples }
    );

    expect(samples.some((sample) => sample.nativeLength > 0)).toBe(true);
    expect(samples.some((sample) => sample.focusPath?.[0] === 2)).toBe(true);
    expect(samples.every((sample) => !sample.nativeIncludesHeading)).toBe(true);
    expect(
      samples.every(
        (sample) =>
          sample.minSelectedBlockIndex === null ||
          sample.minSelectedBlockIndex >= 1
      )
    ).toBe(true);
  });

  test('keeps repeated typing visible after manual scroll-away', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop native typing scroll proof'
    );

    const editor = await openSmallHugeDocument(page, {
      rendering: 'complete',
    });
    const blockTexts = await editor.get.blockTexts();
    const lastBlockIndex = blockTexts.length - 1;

    await scrollBlockIntoView(editor, lastBlockIndex);
    await clickTextBlock(editor, lastBlockIndex);

    await scrollContainersAwayFromCaret(editor);
    await page.keyboard.type(' first-scroll');
    await expect
      .poll(async () =>
        (await getScrollableParentState(editor)).some(
          (state) => state.scrollTop > 0
        )
      )
      .toBe(true);
    await editor.assert.caretVisibleInScrollableParent();

    await scrollContainersAwayFromCaret(editor);
    await page.keyboard.type(' second-scroll');
    await expect
      .poll(async () =>
        (await getScrollableParentState(editor)).some(
          (state) => state.scrollTop > 0
        )
      )
      .toBe(true);
    await editor.assert.caretVisibleInScrollableParent();

    const nextBlockTexts = await editor.get.blockTexts();
    expect(nextBlockTexts[lastBlockIndex]).toContain('first-scroll');
    expect(nextBlockTexts[lastBlockIndex]).toContain('second-scroll');
    expect(nextBlockTexts.slice(0, lastBlockIndex).join('\n')).not.toContain(
      'second-scroll'
    );
  });

  test('keeps clicked refocus position visible in a long editor', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop refocus scroll proof'
    );

    const editor = await openSmallHugeDocument(page, {
      rendering: 'complete',
    });
    const blockTexts = await editor.get.blockTexts();
    const lastBlockIndex = blockTexts.length - 1;

    await scrollBlockIntoView(editor, 0);
    await clickTextBlock(editor, 0);
    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        return {
          anchorPath: selection?.anchor.path,
          focusPath: selection?.focus.path,
        };
      })
      .toEqual({
        anchorPath: [0, 0],
        focusPath: [0, 0],
      });

    await focusNonEditorSentinel(page);

    await scrollBlockIntoView(editor, lastBlockIndex);
    const beforeClickScrollTop = Math.max(
      ...(await getScrollableParentState(editor)).map(
        (state) => state.scrollTop
      )
    );

    expect(beforeClickScrollTop).toBeGreaterThan(0);

    await clickTextBlock(editor, lastBlockIndex);

    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        return {
          anchorPath: selection?.anchor.path,
          focusPath: selection?.focus.path,
        };
      })
      .toEqual({
        anchorPath: [lastBlockIndex, 0],
        focusPath: [lastBlockIndex, 0],
      });
    await expect
      .poll(async () =>
        (await getScrollableParentState(editor)).some(
          (state) => state.scrollTop > 0
        )
      )
      .toBe(true);
    await editor.assert.caretVisibleInScrollableParent();
  });

  test('keeps caret at the edited block end across repeated manual scroll-away typing', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name === 'mobile',
      'Desktop keyboard scroll proof'
    );

    const editor = await openSmallHugeDocument(page, {
      rendering: 'complete',
    });
    const blockTexts = await editor.get.blockTexts();
    const lastBlockIndex = blockTexts.length - 1;
    const firstText = ' first-scroll';
    const secondText = ' second-scroll';

    let expectedOffset = blockTexts[lastBlockIndex]!.length;

    await scrollBlockIntoView(editor, lastBlockIndex);
    await selectTextBlockOffsetDOM(editor, lastBlockIndex, expectedOffset);
    await expect
      .poll(() => editor.selection.get())
      .toEqual({
        anchor: { path: [lastBlockIndex, 0], offset: expectedOffset },
        focus: { path: [lastBlockIndex, 0], offset: expectedOffset },
      });

    await scrollContainersAwayFromCaret(editor);
    await page.keyboard.type(firstText);
    expectedOffset += firstText.length;

    await editor.assert.selection({
      anchor: { path: [lastBlockIndex, 0], offset: expectedOffset },
      focus: { path: [lastBlockIndex, 0], offset: expectedOffset },
    });
    await editor.assert.caretVisibleInScrollableParent();

    await scrollContainersAwayFromCaret(editor);
    await page.keyboard.type(secondText);
    expectedOffset += secondText.length;

    await editor.assert.selection({
      anchor: { path: [lastBlockIndex, 0], offset: expectedOffset },
      focus: { path: [lastBlockIndex, 0], offset: expectedOffset },
    });
    await editor.assert.caretVisibleInScrollableParent();

    const nextBlockTexts = await editor.get.blockTexts();
    expect(nextBlockTexts[lastBlockIndex]).toContain(firstText);
    expect(nextBlockTexts[lastBlockIndex]).toContain(secondText);
    expect(nextBlockTexts[0]).not.toContain(secondText);

    await page.keyboard.press(BROWSER_UNDO_HOTKEY);
    await page.waitForTimeout(250);

    await editor.assert.selection({
      anchor: {
        path: [lastBlockIndex, 0],
        offset: blockTexts[lastBlockIndex]!.length,
      },
      focus: {
        path: [lastBlockIndex, 0],
        offset: blockTexts[lastBlockIndex]!.length,
      },
    });

    await scrollContainersAwayFromCaret(editor);
    await page.keyboard.type(' third-scroll');

    await editor.assert.selection({
      anchor: {
        path: [lastBlockIndex, 0],
        offset: blockTexts[lastBlockIndex]!.length + ' third-scroll'.length,
      },
      focus: {
        path: [lastBlockIndex, 0],
        offset: blockTexts[lastBlockIndex]!.length + ' third-scroll'.length,
      },
    });
    await editor.assert.caretVisibleInScrollableParent();

    const finalBlockTexts = await editor.get.blockTexts();
    expect(finalBlockTexts[lastBlockIndex]).toContain('third-scroll');
    expect(finalBlockTexts[0]).not.toContain('third-scroll');
  });
});
