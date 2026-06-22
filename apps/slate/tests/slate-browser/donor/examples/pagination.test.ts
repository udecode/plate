import { expect, test } from '@playwright/test';
import { openExample } from '@platejs/browser/playwright';

type SlateBrowserEditor = Awaited<ReturnType<typeof openExample>>;
type SlateSelectionSnapshot = Awaited<
  ReturnType<SlateBrowserEditor['selection']['get']>
>;

const expectCollapsedModelMatchesDOMSelection = async (
  editor: SlateBrowserEditor
) => {
  let syncedSelection: SlateSelectionSnapshot = null;

  await expect
    .poll(async () => {
      const modelSelection = await editor.selection.get();
      const domSelection = await editor.selection.importDOM().catch(() => null);
      const pointsMatch = (
        left: NonNullable<SlateSelectionSnapshot>['anchor'],
        right: NonNullable<SlateSelectionSnapshot>['anchor']
      ) =>
        left.offset === right.offset &&
        left.path.length === right.path.length &&
        left.path.every((part, index) => part === right.path[index]);

      if (
        !modelSelection ||
        !domSelection ||
        !pointsMatch(modelSelection.anchor, modelSelection.focus) ||
        !pointsMatch(domSelection.anchor, domSelection.focus) ||
        !pointsMatch(modelSelection.anchor, domSelection.anchor)
      ) {
        return false;
      }

      syncedSelection = modelSelection;

      return true;
    })
    .toBe(true);

  return syncedSelection!;
};

const getLeadingElementBoxes = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  count: number
) =>
  root.locator('[data-slate-node="element"]').evaluateAll(
    (elements, expectedCount) =>
      elements.slice(0, expectedCount).map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          height: rect.height,
          top: rect.top,
        };
      }),
    count
  );

const getCaretAndFrameLeft = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate((element: HTMLElement) => {
    const selection = element.ownerDocument.getSelection();
    const frame = element.ownerDocument.querySelector(
      '[data-testid="pagination-content-frame"]'
    );

    if (!selection || selection.rangeCount === 0 || !frame) {
      return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    const marker = element.ownerDocument.createElement('span');

    marker.textContent = '|';
    range.insertNode(marker);

    const caretRect = marker.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    marker.remove();

    return {
      caretLeft: caretRect.left,
      frameLeft: frameRect.left,
    };
  });

const getPaginationLeafStyleForText = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  text: string
) =>
  root.evaluate((element: HTMLElement, targetText) => {
    const leaves = Array.from(
      element.querySelectorAll<HTMLElement>('[data-slate-leaf]')
    ).filter((leaf) => leaf.textContent?.includes(targetText));

    if (leaves.length === 0) {
      return null;
    }

    const styles = leaves.map((leaf) => getComputedStyle(leaf));

    return {
      hasUnderline: styles.some((style) =>
        style.textDecorationLine.split(' ').includes('underline')
      ),
      isBold: styles.some((style) => {
        const fontWeight = Number.parseInt(style.fontWeight, 10);

        return Number.isFinite(fontWeight)
          ? fontWeight >= 600
          : style.fontWeight === 'bold';
      }),
      isItalic: styles.some((style) => style.fontStyle === 'italic'),
    };
  }, text);

const getPaginationElementTag = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  path: string
) =>
  root
    .locator(`[data-slate-node="element"][data-slate-path="${path}"]`)
    .first()
    .evaluate((element) => element.tagName.toLowerCase());

const getBrowserModKey = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate(() =>
    /Mac OS X/.test(navigator.userAgent) ? 'Meta' : 'Control'
  );

const getParagraphBlankTailPoint = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  path: string
) =>
  root.evaluate((element: HTMLElement, paragraphPath) => {
    const paragraph = element.querySelector(
      `[data-slate-path="${paragraphPath}"]`
    );
    const strings = paragraph
      ? Array.from(paragraph.querySelectorAll('[data-slate-string]'))
      : [];
    const lastString = strings.at(-1);

    if (!paragraph || !lastString) {
      return null;
    }

    const paragraphRect = paragraph.getBoundingClientRect();
    const lastStringRect = lastString.getBoundingClientRect();

    return {
      x: Math.min(paragraphRect.right - 12, lastStringRect.right + 80),
      y: (lastStringRect.top + lastStringRect.bottom) / 2,
    };
  }, path);

const getParagraphGapPoint = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  beforePath: string,
  afterPath: string
) =>
  root.evaluate(
    (element: HTMLElement, paths) => {
      const before = element.querySelector(
        `[data-slate-path="${paths.beforePath}"]`
      );
      const after = element.querySelector(
        `[data-slate-path="${paths.afterPath}"]`
      );

      if (!before || !after) {
        return null;
      }

      const beforeRect = before.getBoundingClientRect();
      const afterRect = after.getBoundingClientRect();
      const strings = Array.from(
        before.querySelectorAll('[data-slate-string]')
      );
      const lastStringRect = strings.at(-1)?.getBoundingClientRect();

      return {
        x: lastStringRect
          ? Math.min(beforeRect.right - 12, lastStringRect.right + 80)
          : beforeRect.left + beforeRect.width / 2,
        y: (beforeRect.bottom + afterRect.top) / 2,
      };
    },
    { afterPath, beforePath }
  );

const getPaginationTableProof = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate((element: HTMLElement) => {
    const table = document.querySelector(
      '[data-testid="pagination-rich-table"]'
    );
    const tablePath = table?.getAttribute('data-slate-path') ?? null;
    const frames = Array.from(
      document.querySelectorAll('[data-testid="pagination-content-frame"]')
    ).map((frame) => frame.getBoundingClientRect());
    const rows = Array.from(
      document.querySelectorAll('[data-testid="pagination-rich-table-row"]')
    );
    const visibleRows = rows
      .map((row) => {
        const rect = row.getBoundingClientRect();

        return {
          display: getComputedStyle(row).display,
          height: rect.height,
          left: rect.left,
          path: row.getAttribute('data-slate-path'),
          rowIndex: row.getAttribute('data-pagination-row-index'),
          top: rect.top,
          width: rect.width,
        };
      })
      .filter((row) => row.display !== 'none' && row.height > 0);
    const rowFrameIndexes = visibleRows.map((row) =>
      frames.findIndex(
        (frame) =>
          row.left >= frame.left - 1 &&
          row.left + row.width <= frame.right + 1 &&
          row.top >= frame.top - 1 &&
          row.top + row.height <= frame.bottom + 1
      )
    );
    const visibleCellCount = Array.from(
      document.querySelectorAll('[data-testid="pagination-rich-table-cell"]')
    ).filter((cell) => cell.getBoundingClientRect().height > 0).length;
    const pathCounts = new Map<string, number>();

    if (tablePath) {
      document
        .querySelectorAll(
          `[data-slate-path="${tablePath}"], [data-slate-path^="${tablePath},"]`
        )
        .forEach((element) => {
          const path = element.getAttribute('data-slate-path');

          if (path) {
            pathCounts.set(path, (pathCounts.get(path) ?? 0) + 1);
          }
        });
    }

    return {
      duplicatePaths: [...pathCounts]
        .filter(([, count]) => count > 1)
        .map(([path]) => path),
      mountedCellCount: document.querySelectorAll(
        '[data-testid="pagination-rich-table-cell"]'
      ).length,
      mountedRowCount: rows.length,
      rowFrameIndexes,
      tableCount: document.querySelectorAll(
        '[data-testid="pagination-rich-table"]'
      ).length,
      tablePath,
      visibleCellCount,
      visibleRowCount: visibleRows.length,
    };
  });

const getPaginationVirtualizedTableProof = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate(() => {
    const editor = document.querySelector('[contenteditable="true"]');
    const metaText =
      document.querySelector('.slate-pagination-meta')?.textContent ?? '';
    const pageTotal = Number(metaText.match(/pages (\d+)/)?.[1] ?? 0);
    const pageOverscan = Number(
      metaText.match(/page overscan (\d+)/)?.[1] ?? 0
    );
    const tablePageCount = Number(
      metaText.match(/table pages (\d+)/)?.[1] ?? 0
    );
    const stressPageCount = Number(
      metaText.match(/stress pages (\d+)/)?.[1] ?? 0
    );
    const rows = Array.from(
      document.querySelectorAll('[data-testid="pagination-rich-table-row"]')
    );
    const rowIndexes = rows
      .map((row) => Number(row.getAttribute('data-pagination-row-index')))
      .filter(Number.isFinite)
      .sort((left, right) => left - right);

    return {
      firstRowIndex: rowIndexes[0] ?? null,
      hasRow120: rowIndexes.includes(119),
      lastRowIndex: rowIndexes.at(-1) ?? null,
      mountedCellCount: document.querySelectorAll(
        '[data-testid="pagination-rich-table-cell"]'
      ).length,
      mountedRowCount: rows.length,
      pageSurfaceCount: document.querySelectorAll('[data-slate-page-surface]')
        .length,
      pageTotal,
      pageOverscan,
      pageVirtualizationEnabled: Boolean(
        document.querySelector(
          '[data-slate-paged-editable-page-virtualization="true"]'
        )
      ),
      stressPageCount,
      tablePageCount,
      tableMounted: Boolean(
        document.querySelector('[data-testid="pagination-rich-table"]')
      ),
      totalElementCount:
        editor?.querySelectorAll('*').length ??
        document.querySelectorAll('*').length,
    };
  });

const getMountedPaginationPageIndexes = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate(() =>
    Array.from(document.querySelectorAll('[data-slate-page]'))
      .map((page) => Number(page.getAttribute('data-slate-page-index')))
      .filter(Number.isFinite)
      .sort((left, right) => left - right)
  );

type PaginationFastScrollSample = {
  eventToPaintMs: number;
  firstRowIndex: number | null;
  hitVisibleContentCount: number;
  lastRowIndex: number | null;
  mountedCellCount: number;
  mountedRowCount: number;
  pageSurfaceCount: number;
  totalElementCount: number;
  visibleText: string;
  visibleRowCount: number;
  visibleRowText: string;
};

type PaginationMiddleTypingSample = {
  blockRect?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  } | null;
  blockText?: string | null;
  blockVisible: boolean;
  candidateCount?: number;
  composeMs: number;
  eventToPaintMs: number;
  hasExpectedText: boolean;
  inputEventCount?: number;
  inputState?: unknown;
  kernelTrace?: unknown[];
  lastInputToPaintMs?: number;
  modelHasExpectedText?: boolean;
  modelSelection?: unknown;
  modelTextSnippet?: string | null;
  nativeSelection?: {
    anchorOffset: number;
    anchorProjectedDOMSync: string | null;
    anchorSyncReason: string | null;
    anchorPath: string | null;
    anchorText: string | null;
    focusOffset: number;
    focusProjectedDOMSync: string | null;
    focusSyncReason: string | null;
    focusPath: string | null;
    focusText: string | null;
  } | null;
  pageSurfaceCount: number;
  profiler?: {
    byKind: Record<string, number>;
    byKey: Record<string, number>;
    durationsById: Record<string, number>;
    total: number;
  };
  sampleCount?: number;
  textObservedMs?: number | null;
  totalElementCount: number;
  viewportRect?: {
    bottom: number;
    left: number;
    right: number;
    top: number;
  } | null;
  visibleCandidateCount?: number;
};

type PaginationProjectedTextTarget = {
  blockPath: string;
  blockText: string;
  firstLeafLeft: number;
  firstLeafTop: number;
  leafText: string;
  visibleLeafCount: number;
  x: number;
  y: number;
};

type PaginationProjectedTextProof = {
  absoluteLeafCount: number;
  blockText: string | null;
  domSync: string | null;
  firstVisibleLeafLeft: number | null;
  firstVisibleLeafTop: number | null;
  pageSurfaceCount: number;
  reason: string | null;
  staticLeafCount: number;
  totalElementCount: number;
  visibleLeafCount: number;
};

const getVisibleProjectedPaginationTextTarget = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const viewportRect = viewport?.getBoundingClientRect();

    if (!viewportRect) {
      return null;
    }

    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-slate-node="element"][data-slate-path]'
      )
    )
      .flatMap((block) => {
        const blockPath = block.getAttribute('data-slate-path');

        if (!blockPath || blockPath.includes(',')) {
          return [];
        }

        const textHost = block.querySelector<HTMLElement>(
          `[data-slate-node="text"][data-slate-path="${blockPath},0"]`
        );
        const visibleLeaves = Array.from(
          block.querySelectorAll<HTMLElement>('[data-slate-leaf]')
        )
          .map((leaf) => {
            const rect = leaf.getBoundingClientRect();

            return {
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              text: leaf.textContent?.replace(/\s+/g, ' ').trim() ?? '',
              top: rect.top,
              width: rect.width,
            };
          })
          .filter(
            (leaf) =>
              leaf.text.length > 0 &&
              leaf.width > 0 &&
              leaf.bottom > viewportRect.top + 32 &&
              leaf.top < viewportRect.bottom - 32 &&
              leaf.right > viewportRect.left &&
              leaf.left < viewportRect.right
          );

        if (visibleLeaves.length === 0) {
          return [];
        }

        const blockRect = block.getBoundingClientRect();
        const maxLeafWidth = Math.max(
          ...visibleLeaves.map((leaf) => leaf.width)
        );
        const firstLeaf = visibleLeaves[0]!;

        if (
          textHost?.getAttribute('data-slate-dom-sync-reason') !==
            'projection' ||
          visibleLeaves.length < 6 ||
          blockRect.width <= maxLeafWidth * 1.5
        ) {
          return [];
        }

        return [
          {
            blockPath,
            blockText: block.textContent ?? '',
            firstLeafLeft: firstLeaf.left,
            firstLeafTop: firstLeaf.top,
            leafText: firstLeaf.text,
            visibleLeafCount: visibleLeaves.length,
            x: firstLeaf.left + 40,
            y: (firstLeaf.top + firstLeaf.bottom) / 2,
          } satisfies PaginationProjectedTextTarget,
        ];
      })
      .sort(
        (left, right) =>
          right.visibleLeafCount - left.visibleLeafCount ||
          right.firstLeafTop - left.firstLeafTop
      );

    return candidates[0] ?? null;
  });

const getVisiblePaginationTextTarget = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate(() => {
    const viewport = document.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const viewportRect = viewport?.getBoundingClientRect();

    if (!viewportRect) {
      return null;
    }

    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-slate-node="element"][data-slate-path]'
      )
    )
      .flatMap((block) => {
        const blockPath = block.getAttribute('data-slate-path');

        if (!blockPath || blockPath.includes(',')) {
          return [];
        }

        const textHost = block.querySelector<HTMLElement>(
          `[data-slate-node="text"][data-slate-path="${blockPath},0"]`
        );

        if (!textHost) {
          return [];
        }

        const visibleLeaves = Array.from(
          textHost.querySelectorAll<HTMLElement>('[data-slate-leaf]')
        )
          .map((leaf) => {
            const rect = leaf.getBoundingClientRect();

            return {
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              text: leaf.textContent?.replace(/\s+/g, ' ').trim() ?? '',
              top: rect.top,
              width: rect.width,
            };
          })
          .filter(
            (leaf) =>
              leaf.text.length > 0 &&
              leaf.width > 0 &&
              leaf.bottom > viewportRect.top + 32 &&
              leaf.top < viewportRect.bottom - 32 &&
              leaf.right > viewportRect.left &&
              leaf.left < viewportRect.right
          );

        if (visibleLeaves.length === 0) {
          return [];
        }

        const firstLeaf = visibleLeaves[0]!;

        return [
          {
            blockPath,
            blockText: block.textContent ?? '',
            firstLeafLeft: firstLeaf.left,
            firstLeafTop: firstLeaf.top,
            leafText: firstLeaf.text,
            visibleLeafCount: visibleLeaves.length,
            x: Math.min(firstLeaf.right - 4, firstLeaf.left + 40),
            y: (firstLeaf.top + firstLeaf.bottom) / 2,
          } satisfies PaginationProjectedTextTarget,
        ];
      })
      .sort(
        (left, right) =>
          right.visibleLeafCount - left.visibleLeafCount ||
          left.firstLeafTop - right.firstLeafTop
      );

    return candidates[0] ?? null;
  });

const getVisiblePaginationTextTargetByPath = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  blockPath: string
) =>
  root.evaluate((element: HTMLElement, path) => {
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const viewportRect = viewport?.getBoundingClientRect();
    const block = element.querySelector<HTMLElement>(
      `[data-slate-node="element"][data-slate-path="${path}"]`
    );
    const leaf = block?.querySelector<HTMLElement>('[data-slate-leaf]');

    if (!block || !leaf || !viewportRect) {
      return null;
    }

    const rect = leaf.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0 ||
      rect.bottom <= viewportRect.top + 10 ||
      rect.top >= viewportRect.bottom - 10
    ) {
      return null;
    }

    return {
      blockPath: path,
      blockText: block.textContent ?? '',
      x: Math.min(rect.right - 4, rect.left + 60),
      y: (rect.top + rect.bottom) / 2,
    };
  }, blockPath);

const getPaginationTextAlignmentByPath = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  blockPath: string
) =>
  root.evaluate((element: HTMLElement, path) => {
    const block = element.querySelector<HTMLElement>(
      `[data-slate-node="element"][data-slate-path="${path}"]`
    );
    const leaf = block?.querySelector<HTMLElement>('[data-slate-leaf]');

    if (!block || !leaf) {
      return null;
    }

    const blockRect = block.getBoundingClientRect();
    const leafRect = leaf.getBoundingClientRect();
    const blockStyle = getComputedStyle(block);
    const leafStyle = getComputedStyle(leaf);
    const textRects: {
      bottom: number;
      left: number;
      right: number;
      top: number;
    }[] = [];
    const walker = block.ownerDocument.createTreeWalker(
      block,
      NodeFilter.SHOW_TEXT
    );
    let node = walker.nextNode();

    while (node) {
      if (node.textContent && node.textContent !== '\uFEFF') {
        const range = block.ownerDocument.createRange();

        range.selectNodeContents(node);

        for (const rect of range.getClientRects()) {
          if (rect.width > 0 && rect.height > 0) {
            textRects.push({
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
              top: rect.top,
            });
          }
        }
      }

      node = walker.nextNode();
    }

    const lineRects = textRects
      .reduce<typeof textRects>((groups, rect) => {
        const group = groups.find(
          (candidate) => Math.abs(candidate.top - rect.top) <= 0.5
        );

        if (!group) {
          groups.push({ ...rect });
          return groups;
        }

        group.bottom = Math.max(group.bottom, rect.bottom);
        group.left = Math.min(group.left, rect.left);
        group.right = Math.max(group.right, rect.right);
        return groups;
      }, [])
      .sort((left, right) => left.top - right.top)
      .map((rect) => ({
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: rect.right - rect.left,
      }));

    return {
      blockLeft: blockRect.left,
      blockWidth: blockRect.width,
      firstLeafLeft: leafRect.left,
      firstLeafPosition: leafStyle.position,
      lineRects,
      paddingLeft: Number.parseFloat(blockStyle.paddingLeft) || 0,
      relativeLeft: leafRect.left - blockRect.left,
    };
  }, blockPath);

const getPaginationDragAutoscrollTarget = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  direction: 'bottom' | 'top'
) =>
  root.evaluate(async (element: HTMLElement, scrollDirection) => {
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );

    if (!viewport) {
      return null;
    }

    if (scrollDirection === 'top') {
      viewport.scrollTop = Math.min(
        900,
        viewport.scrollHeight - viewport.clientHeight
      );
    } else {
      viewport.scrollTop = 0;
    }

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const viewportRect = viewport.getBoundingClientRect();
    const minTop = viewportRect.top + (scrollDirection === 'top' ? 80 : 48);
    const maxBottom =
      viewportRect.bottom - (scrollDirection === 'top' ? 48 : 80);
    const strings = Array.from(
      element.ownerDocument.querySelectorAll<HTMLElement>('[data-slate-string]')
    );
    const candidates = strings
      .map((string) => {
        const rect = string.getBoundingClientRect();
        const visibleTop = Math.max(rect.top, minTop);
        const visibleBottom = Math.min(rect.bottom, maxBottom);

        return {
          rect,
          string,
          visibleBottom,
          visibleTop,
        };
      })
      .filter(
        ({ rect, visibleBottom, visibleTop }) =>
          rect.width > 0 && rect.height > 0 && visibleBottom > visibleTop
      )
      .sort((left, right) => left.visibleTop - right.visibleTop);
    const target = candidates[0];

    if (!target) {
      return null;
    }

    const { rect, string } = target;
    const x = Math.min(rect.right - 4, rect.left + 64);
    const minStartY = viewportRect.top + 24;
    const maxStartY = viewportRect.bottom - 24;
    const unclampedStartY = (target.visibleTop + target.visibleBottom) / 2;

    return {
      edge: {
        x,
        y:
          scrollDirection === 'top'
            ? viewportRect.top + 2
            : viewportRect.bottom - 2,
      },
      initialScrollTop: viewport.scrollTop,
      start: {
        x,
        y: Math.min(maxStartY, Math.max(minStartY, unclampedStartY)),
      },
      text: string.textContent ?? '',
    };
  }, direction);

const getVisiblePaginationLineMarginTargetByPath = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  blockPath: string
) =>
  root.evaluate((element: HTMLElement, path) => {
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const viewportRect = viewport?.getBoundingClientRect();
    const block = element.querySelector<HTMLElement>(
      `[data-slate-node="element"][data-slate-path="${path}"]`
    );
    const leaf = block?.querySelector<HTMLElement>('[data-slate-leaf]');

    if (!block || !leaf || !viewportRect) {
      return null;
    }

    const rect = leaf.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0 ||
      rect.bottom <= viewportRect.top + 10 ||
      rect.top >= viewportRect.bottom - 10
    ) {
      return null;
    }

    return {
      blockPath: path,
      blockText: block.textContent ?? '',
      x: rect.left - 60,
      y: (rect.top + rect.bottom) / 2,
    };
  }, blockPath);

const getVisiblePaginationWrappedLineMarginTargets = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  side: 'left' | 'right'
) =>
  root.evaluate(
    (element: HTMLElement, targetSide) => {
      const edge = targetSide as 'end' | 'start';
      const getRectVerticalDistance = (rect: DOMRect, y: number) =>
        y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
      const cssBreakWhitespacePattern = /^[\t\n\f\r ]$/;
      const getCollapsedOffsetLineRelation = (
        textNode: ChildNode,
        offset: number,
        lineRect: DOMRect
      ): 'inside' | 'outside' | 'unavailable' => {
        const range = element.ownerDocument.createRange();

        range.setStart(textNode, offset);
        range.setEnd(textNode, offset);

        const collapsedRects = Array.from(range.getClientRects()).filter(
          (rect) => rect.width > 0 || rect.height > 0
        );

        if (collapsedRects.length === 0) {
          return 'unavailable';
        }

        const y = lineRect.top + lineRect.height / 2;
        const tolerance = Math.max(2, lineRect.height / 4);

        return collapsedRects.every(
          (collapsedRect) =>
            getRectVerticalDistance(collapsedRect, y) > tolerance
        )
          ? 'outside'
          : 'inside';
      };
      const areSegmentRectsOutsideLine = (
        textNode: ChildNode,
        start: number,
        end: number,
        lineRect: DOMRect
      ) => {
        const range = element.ownerDocument.createRange();

        range.setStart(textNode, start);
        range.setEnd(textNode, end);

        const segmentRects = Array.from(range.getClientRects()).filter(
          (rect) => rect.width > 0 || rect.height > 0
        );

        if (segmentRects.length === 0) {
          return false;
        }

        const y = lineRect.top + lineRect.height / 2;
        const tolerance = Math.max(2, lineRect.height / 4);

        return segmentRects.every(
          (segmentRect) => getRectVerticalDistance(segmentRect, y) > tolerance
        );
      };
      const getLineEdgeOffset = (
        textNode: ChildNode,
        lineRect: DOMRect,
        edge: 'end' | 'start'
      ) => {
        const textLength = textNode.textContent?.length ?? 0;
        const y = lineRect.top + lineRect.height / 2;
        const range = element.ownerDocument.createRange();
        let best: { distance: number; offset: number } | null = null;

        for (let offset = 0; offset < textLength; offset++) {
          const nextOffset = offset + 2;

          range.setStart(textNode, offset);
          range.setEnd(textNode, offset + 1);

          for (const rect of Array.from(range.getClientRects())) {
            const verticalDistance = getRectVerticalDistance(rect, y);
            const verticalCenterDistance = Math.abs(
              rect.top + rect.height / 2 - y
            );
            const horizontalDistance =
              edge === 'start'
                ? Math.abs(rect.left - lineRect.left)
                : Math.abs(rect.right - lineRect.right);
            const segment = textNode.textContent?.[offset] ?? '';
            const collapsedRelation = cssBreakWhitespacePattern.test(segment)
              ? getCollapsedOffsetLineRelation(textNode, offset + 1, lineRect)
              : 'inside';
            const edgeOffset =
              edge === 'end' &&
              cssBreakWhitespacePattern.test(segment) &&
              (collapsedRelation === 'outside' ||
                (nextOffset <= textLength &&
                  collapsedRelation === 'unavailable' &&
                  areSegmentRectsOutsideLine(
                    textNode,
                    offset + 1,
                    nextOffset,
                    lineRect
                  )))
                ? offset
                : offset + 1;
            const distance =
              verticalDistance * 1_000_000 +
              verticalCenterDistance * 1000 +
              horizontalDistance;

            if (!best || distance < best.distance) {
              best = {
                distance,
                offset: edge === 'start' ? offset : edgeOffset,
              };
            }
          }
        }

        return best?.offset ?? (edge === 'start' ? 0 : textLength);
      };
      const toNumber = (value: string | null) =>
        value === null ? null : Number.parseInt(value, 10);
      const getStringDocumentOffset = (
        textHost: HTMLElement,
        string: HTMLElement,
        lineOffset: number
      ) => {
        const leaf = string.closest<HTMLElement>('[data-slate-leaf]');
        const leafStart = toNumber(
          leaf ? leaf.getAttribute('data-slate-leaf-start') : null
        );
        const leafEnd = toNumber(
          leaf ? leaf.getAttribute('data-slate-leaf-end') : null
        );

        if (
          leafStart !== null &&
          leafEnd !== null &&
          Number.isFinite(leafStart) &&
          Number.isFinite(leafEnd)
        ) {
          return Math.max(leafStart, Math.min(leafStart + lineOffset, leafEnd));
        }

        let offset = 0;

        for (const candidate of Array.from(
          textHost.querySelectorAll<HTMLElement>(
            '[data-slate-string], [data-slate-zero-width]'
          )
        )) {
          const length = candidate.hasAttribute('data-slate-zero-width')
            ? 0
            : (candidate.textContent?.length ?? 0);

          if (candidate === string) {
            return offset + lineOffset;
          }

          offset += length;
        }

        return null;
      };
      const viewport = element.ownerDocument.querySelector<HTMLElement>(
        '[data-testid="pagination-viewport"]'
      );
      const viewportRect = viewport?.getBoundingClientRect();

      if (!viewportRect) {
        return [];
      }

      for (const block of Array.from(
        element.querySelectorAll<HTMLElement>(
          '[data-slate-node="element"][data-slate-path]'
        )
      )) {
        const blockPath = block.getAttribute('data-slate-path');

        if (!blockPath || blockPath.includes(',')) {
          continue;
        }

        const textHost = block.querySelector<HTMLElement>(
          '[data-slate-node="text"]'
        );
        const page = Array.from(
          element.ownerDocument.querySelectorAll<HTMLElement>(
            '[data-slate-page]'
          )
        ).find((candidate) => {
          const rect = candidate.getBoundingClientRect();
          const blockRect = block.getBoundingClientRect();

          return blockRect.top < rect.bottom && blockRect.bottom > rect.top;
        });
        if (!textHost || !page) {
          continue;
        }

        const frame = page.querySelector<HTMLElement>(
          '[data-testid="pagination-content-frame"]'
        );
        const rectEntries = Array.from(
          textHost.querySelectorAll<HTMLElement>('[data-slate-string]')
        ).flatMap((string) =>
          Array.from(string.getClientRects())
            .filter(
              (rect) =>
                rect.width > 0 &&
                rect.height > 0 &&
                rect.bottom > viewportRect.top + 10 &&
                rect.top < viewportRect.bottom - 10
            )
            .map((rect) => ({ rect, string }))
        );

        if (rectEntries.length < 3) {
          continue;
        }

        const lineGroups: { rect: DOMRect; string: HTMLElement }[][] = [];

        for (const entry of rectEntries.sort(
          (left, right) => left.rect.top - right.rect.top
        )) {
          const group = lineGroups.find(
            (candidate) => Math.abs(candidate[0]!.rect.top - entry.rect.top) < 2
          );

          if (group) {
            group.push(entry);
          } else {
            lineGroups.push([entry]);
          }
        }

        if (lineGroups.length < 3) {
          continue;
        }

        const pageRect = page.getBoundingClientRect();
        const frameRect = frame?.getBoundingClientRect();
        const targets = lineGroups
          .slice(1, Math.min(lineGroups.length, 6))
          .flatMap((group, lineIndex) => {
            const sortedGroup = group.sort(
              (left, right) => left.rect.left - right.rect.left
            );
            const entry =
              edge === 'start' ? sortedGroup[0]! : sortedGroup.at(-1)!;
            const textNode = Array.from(entry.string.childNodes).find(
              (node) => node.nodeType === Node.TEXT_NODE
            );

            if (!textNode) {
              return [];
            }

            const expectedOffset = getStringDocumentOffset(
              textHost,
              entry.string,
              getLineEdgeOffset(textNode, entry.rect, edge)
            );
            const expectedDOMOffset = getLineEdgeOffset(
              textNode,
              entry.rect,
              edge
            );

            if (expectedOffset === null || !Number.isFinite(expectedOffset)) {
              return [];
            }

            const x =
              edge === 'start'
                ? Math.max(
                    pageRect.left + 4,
                    frameRect
                      ? Math.max(
                          (pageRect.left + frameRect.left) / 2,
                          entry.rect.left - 52
                        )
                      : entry.rect.left - 52
                  )
                : Math.min(
                    pageRect.right - 4,
                    frameRect
                      ? Math.min(
                          (frameRect.right + pageRect.right) / 2,
                          entry.rect.right + 52
                        )
                      : entry.rect.right + 52
                  );

            return [
              {
                blockPath,
                expectedDOMOffset,
                expectedDOMText: entry.string.textContent ?? '',
                expectedOffset,
                lineRect: {
                  bottom: entry.rect.bottom,
                  left: entry.rect.left,
                  right: entry.rect.right,
                  top: entry.rect.top,
                },
                lineIndex: lineIndex + 1,
                lineText: entry.string.textContent ?? '',
                x,
                y: (entry.rect.top + entry.rect.bottom) / 2,
              },
            ];
          });

        if (targets.length > 0) {
          return targets;
        }
      }

      return [];
    },
    side === 'left' ? 'start' : 'end'
  );

const getCollapsedCaretRect = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate((element: HTMLElement) => {
    const selection = element.ownerDocument.getSelection();

    if (!selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0).cloneRange();
    const nativeRect =
      Array.from(range.getClientRects()).find(
        (rect) => rect.width > 0 || rect.height > 0
      ) ?? range.getBoundingClientRect();

    if (nativeRect.width > 0 || nativeRect.height > 0) {
      return {
        bottom: nativeRect.bottom,
        left: nativeRect.left,
        top: nativeRect.top,
      };
    }

    return null;
  });

const getVisiblePaginationRightLineMarginTarget = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate((element: HTMLElement) => {
    const getLineEndOffset = (textNode: ChildNode, lineRect: DOMRect) => {
      const textLength = textNode.textContent?.length ?? 0;
      const y = lineRect.top + lineRect.height / 2;
      const range = element.ownerDocument.createRange();
      let best: { distance: number; offset: number } | null = null;

      for (let offset = 0; offset < textLength; offset++) {
        range.setStart(textNode, offset);
        range.setEnd(textNode, offset + 1);

        for (const rect of Array.from(range.getClientRects())) {
          const verticalDistance =
            y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
          const horizontalDistance = Math.abs(rect.right - lineRect.right);
          const distance = verticalDistance * 1000 + horizontalDistance;

          if (!best || distance < best.distance) {
            best = { distance, offset: offset + 1 };
          }
        }
      }

      return best?.offset ?? null;
    };
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const viewportRect = viewport?.getBoundingClientRect();

    if (!viewportRect) {
      return null;
    }

    for (const block of Array.from(
      element.querySelectorAll<HTMLElement>('[data-slate-path]')
    )) {
      const path = block.getAttribute('data-slate-path');

      if (!path || path.includes(',')) {
        continue;
      }

      const strings = Array.from(
        block.querySelectorAll<HTMLElement>('[data-slate-string]')
      );
      const blockRect = block.getBoundingClientRect();
      const rootRect = element.getBoundingClientRect();

      for (const string of strings) {
        const textNode = Array.from(string.childNodes).find(
          (node) => node.nodeType === Node.TEXT_NODE
        );
        const rects = Array.from(string.getClientRects()).filter(
          (rect) => rect.width > 0 && rect.height > 0
        );

        if (!textNode || rects.length === 0) {
          continue;
        }

        const rect = rects[0]!;
        const lineOffset = getLineEndOffset(textNode, rect);
        const leaf = string.closest<HTMLElement>('[data-slate-leaf]');
        const leafStartAttribute = leaf?.getAttribute('data-slate-leaf-start');
        const leafEndAttribute = leaf?.getAttribute('data-slate-leaf-end');
        const leafStart =
          leafStartAttribute == null
            ? 0
            : Number.parseInt(leafStartAttribute, 10);
        const leafEnd =
          leafEndAttribute == null
            ? null
            : Number.parseInt(leafEndAttribute, 10);
        const blockText = block.textContent ?? '';
        const expectedOffset =
          leafEnd !== null && Number.isFinite(leafEnd)
            ? leafEnd
            : lineOffset == null || !Number.isFinite(leafStart)
              ? null
              : leafStart + lineOffset;
        const x = Math.min(rootRect.right - 12, rect.right + 60);

        if (
          expectedOffset == null ||
          expectedOffset >= blockText.length ||
          rect.bottom <= viewportRect.top + 10 ||
          rect.top >= viewportRect.bottom - 10 ||
          x <= rect.right + 8 ||
          x <= blockRect.left ||
          x >= rootRect.right
        ) {
          continue;
        }

        return {
          blockPath: path,
          blockText,
          expectedOffset,
          x,
          y: (rect.top + rect.bottom) / 2,
        };
      }
    }

    return null;
  });

const getVisiblePaginationTableRowMarginTargets = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  rowIndex: number
) =>
  root.evaluate(async (element: HTMLElement, index) => {
    const getRow = () =>
      element.ownerDocument.querySelector<HTMLElement>(
        `[data-testid="pagination-rich-table-row"][data-pagination-row-index="${index}"]`
      );
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const waitFrame = () => new Promise(requestAnimationFrame);
    let row = getRow();

    if (viewport && !row) {
      const maxScrollTop = Math.max(
        0,
        viewport.scrollHeight - viewport.clientHeight
      );

      for (const ratio of [0.2, 0.35, 0.5, 0.65, 0.8, 1]) {
        viewport.scrollTop = Math.round(maxScrollTop * ratio);
        await waitFrame();
        await waitFrame();
        row = getRow();

        if (row) {
          break;
        }
      }
    }

    if (!row || !viewport) {
      return null;
    }

    row.scrollIntoView({ block: 'center' });
    await waitFrame();

    const rowRect = row.getBoundingClientRect();
    const page = Array.from(
      element.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-slate-page-index]'
      )
    ).find((candidate) => {
      const rect = candidate.getBoundingClientRect();

      return rowRect.top < rect.bottom && rowRect.bottom > rect.top;
    });

    if (!page) {
      return null;
    }

    const pageIndex = page.getAttribute('data-slate-page-index');
    const frame =
      pageIndex == null
        ? null
        : element.ownerDocument.querySelector<HTMLElement>(
            `[data-slate-page-index="${pageIndex}"] [data-testid="pagination-content-frame"]`
          );
    const cells = Array.from(
      row.querySelectorAll<HTMLElement>(
        '[data-testid="pagination-rich-table-cell"]'
      )
    );
    const firstTextHost = cells[0]?.querySelector<HTMLElement>(
      '[data-slate-node="text"]'
    );
    const lastTextHost = cells
      .at(-1)
      ?.querySelector<HTMLElement>('[data-slate-node="text"]');

    if (!frame || !firstTextHost || !lastTextHost) {
      return null;
    }

    const pageRect = page.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const y = (rowRect.top + rowRect.bottom) / 2;
    const leftPath = firstTextHost.getAttribute('data-slate-path');
    const rightPath = lastTextHost.getAttribute('data-slate-path');
    const rightText = lastTextHost.textContent ?? '';

    if (!leftPath || !rightPath) {
      return null;
    }

    return {
      left: {
        expectedOffset: 0,
        expectedPath: leftPath.split(',').map(Number),
        x: (pageRect.left + frameRect.left) / 2,
        y,
      },
      right: {
        expectedOffset: rightText.length,
        expectedPath: rightPath.split(',').map(Number),
        x: (frameRect.right + pageRect.right) / 2,
        y,
      },
    };
  }, rowIndex);

const getFirstPageMarginClickMatrix = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate((element: HTMLElement) => {
    const pageElement = element.ownerDocument.querySelector<HTMLElement>(
      '[data-slate-page-index="0"]'
    );
    const frameElement = element.ownerDocument.querySelector<HTMLElement>(
      '[data-slate-page-index="0"] [data-testid="pagination-content-frame"]'
    );
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const table = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-rich-table"]'
    );
    const tablePathText = table?.getAttribute('data-slate-path');
    const tableTopLevelPath = tablePathText
      ? Number(tablePathText.split(',')[0])
      : null;

    if (
      !pageElement ||
      !frameElement ||
      !viewport ||
      tableTopLevelPath == null ||
      !Number.isFinite(tableTopLevelPath)
    ) {
      return null;
    }

    const pageRect = pageElement.getBoundingClientRect();
    const frameRect = frameElement.getBoundingClientRect();
    const midpoint = (start: number, end: number) => (start + end) / 2;
    const insidePage = (point: { x: number; y: number }) =>
      point.x > pageRect.left + 2 &&
      point.x < pageRect.right - 2 &&
      point.y > pageRect.top + 2 &&
      point.y < pageRect.bottom - 2;
    const outsideContent = (point: { x: number; y: number }) =>
      point.x < frameRect.left ||
      point.x > frameRect.right ||
      point.y < frameRect.top ||
      point.y > frameRect.bottom;

    const firstPageTopLevelPaths = Array.from(
      element.querySelectorAll<HTMLElement>(
        '[data-slate-node="element"][data-slate-path]'
      )
    )
      .flatMap((node) => {
        const path = node.getAttribute('data-slate-path');

        if (!path || path.includes(',')) {
          return [];
        }

        const rect = node.getBoundingClientRect();
        const intersectsPage =
          rect.width > 0 &&
          rect.height > 0 &&
          rect.right > pageRect.left &&
          rect.left < pageRect.right &&
          rect.bottom > pageRect.top &&
          rect.top < pageRect.bottom;

        return intersectsPage ? [Number(path)] : [];
      })
      .filter((path) => Number.isFinite(path) && path < tableTopLevelPath);

    const targetCandidates = [
      {
        name: 'top-left-corner',
        x: midpoint(pageRect.left, frameRect.left),
        y: midpoint(pageRect.top, frameRect.top),
      },
      {
        name: 'top-center',
        x: midpoint(frameRect.left, frameRect.right),
        y: midpoint(pageRect.top, frameRect.top),
      },
      {
        name: 'top-right-corner',
        x: midpoint(frameRect.right, pageRect.right),
        y: midpoint(pageRect.top, frameRect.top),
      },
      {
        name: 'left-upper-side',
        x: midpoint(pageRect.left, frameRect.left),
        y: frameRect.top + frameRect.height * 0.25,
      },
      {
        name: 'left-middle-side',
        x: midpoint(pageRect.left, frameRect.left),
        y: midpoint(frameRect.top, frameRect.bottom),
      },
      {
        name: 'left-lower-side',
        x: midpoint(pageRect.left, frameRect.left),
        y: frameRect.top + frameRect.height * 0.75,
      },
      {
        name: 'right-upper-side',
        x: midpoint(frameRect.right, pageRect.right),
        y: frameRect.top + frameRect.height * 0.25,
      },
      {
        name: 'right-middle-side',
        x: midpoint(frameRect.right, pageRect.right),
        y: midpoint(frameRect.top, frameRect.bottom),
      },
      {
        name: 'right-lower-side',
        x: midpoint(frameRect.right, pageRect.right),
        y: frameRect.top + frameRect.height * 0.75,
      },
      {
        name: 'bottom-left-corner',
        x: midpoint(pageRect.left, frameRect.left),
        y: midpoint(frameRect.bottom, pageRect.bottom),
      },
      {
        name: 'bottom-center',
        x: midpoint(frameRect.left, frameRect.right),
        y: midpoint(frameRect.bottom, pageRect.bottom),
      },
      {
        name: 'bottom-right-corner',
        x: midpoint(frameRect.right, pageRect.right),
        y: midpoint(frameRect.bottom, pageRect.bottom),
      },
    ];
    const targets = targetCandidates.filter(
      (target) => insidePage(target) && outsideContent(target)
    );

    return {
      firstPageTopLevelPaths: [...new Set(firstPageTopLevelPaths)].sort(
        (left, right) => left - right
      ),
      initialScrollTop: viewport.scrollTop,
      tableTopLevelPath,
      targets,
    };
  });

const getVisiblePaginationTablePageCornerMatrix = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  rowIndex?: number
) =>
  root.evaluate(async (element: HTMLElement, index) => {
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const getTable = () =>
      element.ownerDocument.querySelector<HTMLElement>(
        '[data-testid="pagination-rich-table"]'
      );
    const getRow = () => {
      if (typeof index === 'number') {
        return element.ownerDocument.querySelector<HTMLElement>(
          `[data-testid="pagination-rich-table-row"][data-pagination-row-index="${index}"]`
        );
      }

      return element.ownerDocument.querySelector<HTMLElement>(
        '[data-testid="pagination-rich-table-row"]'
      );
    };
    const waitFrame = () => new Promise(requestAnimationFrame);
    let table = getTable();
    let row = getRow();

    if (viewport && (!table || !row)) {
      const maxScrollTop = Math.max(
        0,
        viewport.scrollHeight - viewport.clientHeight
      );

      for (const ratio of [0.2, 0.35, 0.5, 0.65, 0.8, 1]) {
        viewport.scrollTop = Math.round(maxScrollTop * ratio);
        await waitFrame();
        await waitFrame();
        table = getTable();
        row = getRow();

        if (table && row) {
          break;
        }
      }
    }

    if (!row && table) {
      table.scrollIntoView({ block: 'center' });
      await waitFrame();
      row = getRow();
    }

    const tablePathText = table?.getAttribute('data-slate-path');
    const tableTopLevelPath = tablePathText
      ? Number(tablePathText.split(',')[0])
      : null;

    if (
      !row ||
      !viewport ||
      tableTopLevelPath == null ||
      !Number.isFinite(tableTopLevelPath)
    ) {
      return null;
    }

    row.scrollIntoView({ block: 'center' });
    await waitFrame();

    const rowRect = row.getBoundingClientRect();
    const page = Array.from(
      element.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-slate-page-index]'
      )
    ).find((candidate) => {
      const rect = candidate.getBoundingClientRect();

      return rowRect.top < rect.bottom && rowRect.bottom > rect.top;
    });

    if (!page) {
      return null;
    }

    const pageIndex = page.getAttribute('data-slate-page-index');
    const frame =
      pageIndex == null
        ? null
        : element.ownerDocument.querySelector<HTMLElement>(
            `[data-slate-page-index="${pageIndex}"] [data-testid="pagination-content-frame"]`
          );

    if (!frame) {
      return null;
    }

    const pageRect = page.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const midpoint = (start: number, end: number) => (start + end) / 2;

    return {
      initialScrollTop: viewport.scrollTop,
      tableTopLevelPath,
      targets: [
        {
          name: 'visible-table-page-top-left-corner',
          x: midpoint(pageRect.left, frameRect.left),
          y: midpoint(pageRect.top, frameRect.top),
        },
        {
          name: 'visible-table-page-top-right-corner',
          x: midpoint(frameRect.right, pageRect.right),
          y: midpoint(pageRect.top, frameRect.top),
        },
        {
          name: 'visible-table-page-bottom-left-corner',
          x: midpoint(pageRect.left, frameRect.left),
          y: midpoint(frameRect.bottom, pageRect.bottom),
        },
        {
          name: 'visible-table-page-bottom-right-corner',
          x: midpoint(frameRect.right, pageRect.right),
          y: midpoint(frameRect.bottom, pageRect.bottom),
        },
      ],
    };
  }, rowIndex);

const getDOMSelectionTextPath = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate(() => {
    const selection = document.getSelection();
    const anchorNode = selection?.anchorNode ?? null;
    const anchorElement =
      anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
    const textHost = anchorElement?.closest('[data-slate-node="text"]');

    return textHost?.getAttribute('data-slate-path') ?? null;
  });

const getProjectedPaginationTextProof = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  blockPath: string
) =>
  root.evaluate((element: HTMLElement, path) => {
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const viewportRect = viewport?.getBoundingClientRect();
    const block = element.querySelector<HTMLElement>(
      `[data-slate-node="element"][data-slate-path="${path}"]`
    );
    const textHost = element.querySelector<HTMLElement>(
      `[data-slate-node="text"][data-slate-path="${path},0"]`
    );
    const visibleLeaves = Array.from(
      block?.querySelectorAll<HTMLElement>('[data-slate-leaf]') ?? []
    )
      .map((leaf) => {
        const rect = leaf.getBoundingClientRect();

        return {
          bottom: rect.bottom,
          left: rect.left,
          position: getComputedStyle(leaf).position,
          right: rect.right,
          text: leaf.textContent?.replace(/\s+/g, ' ').trim() ?? '',
          top: rect.top,
          width: rect.width,
        };
      })
      .filter(
        (leaf) =>
          viewportRect &&
          leaf.text.length > 0 &&
          leaf.width > 0 &&
          leaf.bottom > viewportRect.top + 32 &&
          leaf.top < viewportRect.bottom - 32 &&
          leaf.right > viewportRect.left &&
          leaf.left < viewportRect.right
      );
    const firstVisibleLeaf = visibleLeaves[0];

    return {
      absoluteLeafCount: visibleLeaves.filter(
        (leaf) => leaf.position === 'absolute'
      ).length,
      blockText: block?.textContent ?? null,
      domSync: textHost?.getAttribute('data-slate-dom-sync') ?? null,
      firstVisibleLeafLeft: firstVisibleLeaf?.left ?? null,
      firstVisibleLeafTop: firstVisibleLeaf?.top ?? null,
      pageSurfaceCount: element.ownerDocument.querySelectorAll(
        '[data-slate-page-surface]'
      ).length,
      reason: textHost?.getAttribute('data-slate-dom-sync-reason') ?? null,
      staticLeafCount: visibleLeaves.filter(
        (leaf) => leaf.position === 'static'
      ).length,
      totalElementCount: element.querySelectorAll('*').length,
      visibleLeafCount: visibleLeaves.length,
    } satisfies PaginationProjectedTextProof;
  }, blockPath);

const getPaginationFastScrollSample = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  eventStart: number
) =>
  root.evaluate((element: HTMLElement, startedAt) => {
    const viewport = element.ownerDocument.querySelector<HTMLElement>(
      '[data-testid="pagination-viewport"]'
    );
    const viewportRect = viewport?.getBoundingClientRect();
    const contentCandidates = Array.from(
      element.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-slate-node="element"], [data-testid="pagination-rich-table-row"]'
      )
    );
    const getText = (node: HTMLElement) =>
      (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
    const visibleContent = contentCandidates
      .map((node) => ({
        rect: node.getBoundingClientRect(),
        text: getText(node),
      }))
      .filter(({ rect, text }) => {
        if (!viewportRect || text.length === 0) {
          return false;
        }

        return (
          rect.height > 0 &&
          rect.width > 0 &&
          rect.bottom > viewportRect.top + 24 &&
          rect.top < viewportRect.bottom - 24 &&
          rect.right > viewportRect.left &&
          rect.left < viewportRect.right
        );
      });
    const hitVisibleContent = new Set<HTMLElement>();

    if (viewportRect) {
      for (const xRatio of [0.25, 0.5, 0.75]) {
        for (const yRatio of [0.2, 0.35, 0.5, 0.65, 0.8]) {
          const x = viewportRect.left + viewportRect.width * xRatio;
          const y = viewportRect.top + viewportRect.height * yRatio;
          const hit = element.ownerDocument
            .elementsFromPoint(x, y)
            .map((candidate) =>
              candidate.closest<HTMLElement>(
                '[data-slate-node="element"], [data-testid="pagination-rich-table-row"]'
              )
            )
            .find((candidate): candidate is HTMLElement =>
              Boolean(candidate && getText(candidate).length > 0)
            );

          if (hit) {
            hitVisibleContent.add(hit);
          }
        }
      }
    }
    const rows = Array.from(
      element.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-testid="pagination-rich-table-row"]'
      )
    );
    const pageRects = Array.from(
      element.ownerDocument.querySelectorAll<HTMLElement>(
        '[data-slate-page-surface]'
      )
    ).map((surface) => surface.getBoundingClientRect());
    const overlapsRect = (rect: DOMRect, containerRect: DOMRect, padding = 0) =>
      rect.height > 0 &&
      rect.width > 0 &&
      rect.bottom > containerRect.top + padding &&
      rect.top < containerRect.bottom - padding &&
      rect.right > containerRect.left + padding &&
      rect.left < containerRect.right - padding;
    const visibleRows = rows
      .map((row) => ({
        rect: row.getBoundingClientRect(),
        text: getText(row),
      }))
      .filter(({ rect, text }) => {
        if (!viewportRect || text.length === 0) {
          return false;
        }

        return (
          overlapsRect(rect, viewportRect, 24) &&
          pageRects.some((pageRect) => overlapsRect(rect, pageRect, 1))
        );
      });
    const rowIndexes = rows
      .map((row) => Number(row.getAttribute('data-pagination-row-index')))
      .filter(Number.isFinite)
      .sort((left, right) => left - right);
    const visibleText = visibleContent
      .map((content) => content.text)
      .concat([...hitVisibleContent].map(getText))
      .join(' ')
      .slice(0, 500);
    const visibleRowText = visibleRows
      .map((row) => row.text)
      .join(' ')
      .slice(0, 500);

    return {
      eventToPaintMs: performance.now() - startedAt,
      firstRowIndex: rowIndexes[0] ?? null,
      hitVisibleContentCount: hitVisibleContent.size,
      lastRowIndex: rowIndexes.at(-1) ?? null,
      mountedCellCount: element.ownerDocument.querySelectorAll(
        '[data-testid="pagination-rich-table-cell"]'
      ).length,
      mountedRowCount: rows.length,
      pageSurfaceCount: element.ownerDocument.querySelectorAll(
        '[data-slate-page-surface]'
      ).length,
      totalElementCount: element.querySelectorAll('*').length,
      visibleText,
      visibleRowCount: visibleRows.length,
      visibleRowText,
    } satisfies PaginationFastScrollSample;
  }, eventStart);

const getPaginationMiddleTypingSample = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  {
    eventStart,
    expectedText,
    path,
  }: {
    eventStart: number;
    expectedText: string;
    path: number;
  }
) =>
  root.evaluate(
    (
      element: HTMLElement,
      payload: {
        eventStart: number;
        expectedText: string;
        path: number;
      }
    ) => {
      const toSimpleRect = (rect: DOMRect | null | undefined) =>
        rect
          ? {
              bottom: Math.round(rect.bottom),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              top: Math.round(rect.top),
            }
          : null;
      const viewport = element.ownerDocument.querySelector<HTMLElement>(
        '[data-testid="pagination-viewport"]'
      );
      const viewportRect = viewport?.getBoundingClientRect() ?? null;
      const blockCandidates = Array.from(
        element.ownerDocument.querySelectorAll<HTMLElement>(
          `[data-slate-path="${payload.path}"]`
        )
      );
      const blockMatches = blockCandidates.map((candidate) => {
        const rect = candidate.getBoundingClientRect();
        const hasExpectedText =
          candidate.textContent?.includes(payload.expectedText) ?? false;
        const visible = Boolean(
          hasExpectedText &&
            viewportRect &&
            rect.bottom > viewportRect.top + 8 &&
            rect.top < viewportRect.bottom - 8
        );

        return { candidate, hasExpectedText, rect, visible };
      });
      const blockMatch =
        blockMatches.find((match) => match.visible) ??
        blockMatches.find((match) => match.hasExpectedText) ??
        blockMatches[0] ??
        null;
      const block = blockMatch?.candidate ?? null;
      const hasExpectedText = blockMatch?.hasExpectedText ?? false;
      const blockRect = blockMatch?.hasExpectedText ? blockMatch.rect : null;
      const metaText =
        element.ownerDocument.querySelector('.slate-pagination-meta')
          ?.textContent ?? '';

      return {
        blockVisible: Boolean(
          blockRect &&
            viewportRect &&
            blockRect.bottom > viewportRect.top + 8 &&
            blockRect.top < viewportRect.bottom - 8
        ),
        blockRect: toSimpleRect(blockRect),
        blockText: block?.textContent?.slice(0, 160) ?? null,
        candidateCount: blockMatches.length,
        composeMs: Number(metaText.match(/compose ([\d.]+)ms/)?.[1] ?? 0),
        eventToPaintMs: performance.now() - payload.eventStart,
        hasExpectedText,
        pageSurfaceCount: element.ownerDocument.querySelectorAll(
          '[data-slate-page-surface]'
        ).length,
        totalElementCount: element.querySelectorAll('*').length,
        viewportRect: toSimpleRect(viewportRect),
        visibleCandidateCount: blockMatches.filter((match) => match.visible)
          .length,
      } satisfies PaginationMiddleTypingSample;
    },
    { eventStart, expectedText, path }
  );

const armPaginationMiddleTypingProbe = async (
  root: Awaited<ReturnType<typeof openExample>>['root'],
  {
    expectedText,
    path,
    timeoutMs = 5000,
  }: {
    expectedText: string;
    path: number;
    timeoutMs?: number;
  }
) =>
  root.evaluate(
    (
      element: HTMLElement,
      payload: {
        expectedText: string;
        path: number;
        timeoutMs: number;
      }
    ) => {
      const toSimpleRect = (rect: DOMRect | null | undefined) =>
        rect
          ? {
              bottom: Math.round(rect.bottom),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              top: Math.round(rect.top),
            }
          : null;
      const startedAt = performance.now();
      let firstInputStartedAt: number | null = null;
      let inputEventCount = 0;
      let lastInputStartedAt = startedAt;
      let sampleCount = 0;
      let textObservedAt: number | null = null;
      const inputController = new AbortController();
      const global = window as typeof window & {
        __paginationMiddleTypingProfilerEvents?: {
          duration?: number;
          id?: string | null;
          kind?: string;
        }[];
        __paginationMiddleTypingProbe?: Promise<PaginationMiddleTypingSample>;
        __SLATE_REACT_RENDER_PROFILER__?: {
          record: (event: {
            duration?: number;
            id?: string | null;
            kind?: string;
          }) => void;
        };
      };
      const profilerEvents: NonNullable<
        typeof global.__paginationMiddleTypingProfilerEvents
      > = [];

      global.__paginationMiddleTypingProfilerEvents = profilerEvents;
      global.__SLATE_REACT_RENDER_PROFILER__ = {
        record(event) {
          profilerEvents.push({ ...event });
        },
      };
      document.addEventListener(
        'beforeinput',
        () => {
          const now = performance.now();

          if (firstInputStartedAt === null) {
            firstInputStartedAt = now;
            profilerEvents.length = 0;
          }

          inputEventCount += 1;
          lastInputStartedAt = now;
        },
        { capture: true, signal: inputController.signal }
      );
      const findBestBlock = () => {
        const viewport = document.querySelector<HTMLElement>(
          '[data-testid="pagination-viewport"]'
        );
        const viewportRect = viewport?.getBoundingClientRect() ?? null;
        const blockMatches = Array.from(
          document.querySelectorAll<HTMLElement>(
            `[data-slate-path="${payload.path}"]`
          )
        ).map((candidate) => {
          const rect = candidate.getBoundingClientRect();
          const hasExpectedText =
            candidate.textContent?.includes(payload.expectedText) ?? false;
          const visible = Boolean(
            hasExpectedText &&
              viewportRect &&
              rect.bottom > viewportRect.top + 8 &&
              rect.top < viewportRect.bottom - 8
          );

          return { candidate, hasExpectedText, rect, visible };
        });

        const blockMatch =
          blockMatches.find((match) => match.visible) ??
          blockMatches.find((match) => match.hasExpectedText) ??
          blockMatches[0] ??
          null;

        return {
          blockMatch,
          candidateCount: blockMatches.length,
          visibleCandidateCount: blockMatches.filter((match) => match.visible)
            .length,
        };
      };
      const observer = new MutationObserver(() => {
        const { blockMatch } = findBestBlock();

        if (
          textObservedAt === null &&
          blockMatch?.candidate.textContent?.includes(payload.expectedText)
        ) {
          textObservedAt = performance.now();
        }
      });

      observer.observe(element, {
        characterData: true,
        childList: true,
        subtree: true,
      });

      global.__paginationMiddleTypingProbe = new Promise((resolve, reject) => {
        const deadline = startedAt + payload.timeoutMs;
        const getSample = (
          frameObservedAt = performance.now()
        ): PaginationMiddleTypingSample => {
          const { blockMatch, candidateCount, visibleCandidateCount } =
            findBestBlock();
          const block = blockMatch?.candidate ?? null;
          const viewport = document.querySelector<HTMLElement>(
            '[data-testid="pagination-viewport"]'
          );
          const hasExpectedText = blockMatch?.hasExpectedText ?? false;
          const viewportRect = hasExpectedText
            ? viewport?.getBoundingClientRect()
            : null;
          const blockRect = hasExpectedText ? blockMatch?.rect : null;
          const metaText =
            document.querySelector('.slate-pagination-meta')?.textContent ?? '';
          const handle = (element as Record<string, any>).__slateBrowserHandle;
          const modelText =
            typeof handle?.getText === 'function'
              ? (handle.getText() as string)
              : null;
          const modelSelection =
            typeof handle?.getSelection === 'function'
              ? handle.getSelection()
              : null;
          const inputState =
            typeof handle?.getInputState === 'function'
              ? handle.getInputState()
              : null;
          const kernelTrace =
            typeof handle?.getKernelTrace === 'function'
              ? handle.getKernelTrace().slice(-12)
              : [];
          const modelSnippetAnchor =
            modelText?.indexOf('mixed block carries') ?? -1;
          const modelTextSnippet =
            modelText && modelSnippetAnchor >= 0
              ? modelText.slice(
                  Math.max(0, modelSnippetAnchor - 40),
                  modelSnippetAnchor + 120
                )
              : null;
          const nativeSelection = document.getSelection();
          const getNativeEndpoint = (node: Node | null) => {
            const endpointElement =
              node?.nodeType === Node.TEXT_NODE
                ? node.parentElement
                : node instanceof HTMLElement
                  ? node
                  : null;
            const textHost = endpointElement?.closest(
              '[data-slate-node="text"]'
            );

            return {
              path: textHost?.getAttribute('data-slate-path') ?? null,
              projectedDOMSync:
                textHost?.getAttribute('data-slate-projected-dom-sync') ?? null,
              syncReason:
                textHost?.getAttribute('data-slate-dom-sync-reason') ?? null,
              text: node?.textContent?.slice(0, 80) ?? null,
            };
          };
          const nativeAnchor = getNativeEndpoint(
            nativeSelection?.anchorNode ?? null
          );
          const nativeFocus = getNativeEndpoint(
            nativeSelection?.focusNode ?? null
          );
          const byKind: Record<string, number> = {};
          const byKey: Record<string, number> = {};
          const durationsById: Record<string, number> = {};

          for (const event of profilerEvents) {
            if (event.kind) {
              byKind[event.kind] = (byKind[event.kind] ?? 0) + 1;
              const key = event.id ? `${event.kind}:${event.id}` : event.kind;
              byKey[key] = (byKey[key] ?? 0) + 1;
            }

            if (event.duration !== undefined && event.id) {
              durationsById[event.id] =
                (durationsById[event.id] ?? 0) + event.duration;
            }
          }

          return {
            blockVisible: Boolean(
              blockRect &&
                viewportRect &&
                blockRect.bottom > viewportRect.top + 8 &&
                blockRect.top < viewportRect.bottom - 8
            ),
            blockRect: toSimpleRect(blockRect),
            blockText: block?.textContent?.slice(0, 160) ?? null,
            candidateCount,
            composeMs: Number(metaText.match(/compose ([\d.]+)ms/)?.[1] ?? 0),
            eventToPaintMs:
              frameObservedAt - (firstInputStartedAt ?? startedAt),
            hasExpectedText,
            inputState,
            inputEventCount,
            kernelTrace,
            lastInputToPaintMs: frameObservedAt - lastInputStartedAt,
            modelHasExpectedText:
              modelText?.includes(payload.expectedText) ?? false,
            modelSelection,
            modelTextSnippet,
            nativeSelection: nativeSelection
              ? {
                  anchorOffset: nativeSelection.anchorOffset,
                  anchorPath: nativeAnchor.path,
                  anchorProjectedDOMSync: nativeAnchor.projectedDOMSync,
                  anchorSyncReason: nativeAnchor.syncReason,
                  anchorText: nativeAnchor.text,
                  focusOffset: nativeSelection.focusOffset,
                  focusPath: nativeFocus.path,
                  focusProjectedDOMSync: nativeFocus.projectedDOMSync,
                  focusSyncReason: nativeFocus.syncReason,
                  focusText: nativeFocus.text,
                }
              : null,
            pageSurfaceCount: document.querySelectorAll(
              '[data-slate-page-surface]'
            ).length,
            profiler: {
              byKind,
              byKey,
              durationsById,
              total: profilerEvents.length,
            },
            sampleCount,
            textObservedMs:
              textObservedAt === null
                ? null
                : textObservedAt - (firstInputStartedAt ?? startedAt),
            totalElementCount: document.querySelectorAll('*').length,
            viewportRect: toSimpleRect(viewportRect),
            visibleCandidateCount,
          };
        };

        const tick = () => {
          sampleCount += 1;
          const sample = getSample(performance.now());

          if (sample.blockVisible && sample.hasExpectedText) {
            observer.disconnect();
            inputController.abort();
            resolve(sample);
            return;
          }

          if (performance.now() > deadline) {
            observer.disconnect();
            inputController.abort();
            reject(
              new Error(
                `Timed out waiting for pagination typing paint: ${JSON.stringify(
                  sample
                )}`
              )
            );
            return;
          }

          requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
      });
    },
    { expectedText, path, timeoutMs }
  );

const readPaginationMiddleTypingProbe = async (
  root: Awaited<ReturnType<typeof openExample>>['root']
) =>
  root.evaluate(() => {
    const global = window as typeof window & {
      __paginationMiddleTypingProbe?: Promise<PaginationMiddleTypingSample>;
    };

    if (!global.__paginationMiddleTypingProbe) {
      throw new Error('Pagination middle typing probe was not armed');
    }

    return global.__paginationMiddleTypingProbe;
  });

const getPercentile = (values: number[], percentile: number) => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil(sorted.length * percentile) - 1)
  );

  return sorted[index] ?? 0;
};

test.describe('pagination example', () => {
  test.describe.configure({ mode: 'serial' });

  test('renders the existing pagination route as the canonical paged editable surface', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only smoke proof for canonical pagination route'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });

    const proof = await editor.root.evaluate(() => ({
      hasDOMStrategyControl: Boolean(
        Array.from(document.querySelectorAll('label')).some((label) =>
          label.textContent?.includes('DOM strategy')
        )
      ),
      hasMediaSplitControl: Boolean(
        Array.from(document.querySelectorAll('label')).some((label) =>
          label.textContent?.includes('Media split')
        )
      ),
      hasPagedEditable: Boolean(
        document.querySelector('[data-slate-paged-editable]')
      ),
      hasRowsControl: Boolean(
        Array.from(document.querySelectorAll('label')).some((label) =>
          label.textContent?.includes('Rows')
        )
      ),
      pageSurfaceCount: document.querySelectorAll('[data-slate-page-surface]')
        .length,
      text: document.body.textContent,
    }));

    expect(proof.hasPagedEditable).toBe(true);
    expect(proof.hasDOMStrategyControl).toBe(true);
    expect(proof.hasMediaSplitControl).toBe(true);
    expect(proof.hasRowsControl).toBe(true);
    expect(proof.pageSurfaceCount).toBeGreaterThan(1);
    expect(proof.text).toContain('Premirror Milestone 1 test document');
  });

  test('supports mark and heading keyboard shortcuts in the pagination editor', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination keyboard shortcuts'
    );

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single' },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const markedText = 'Z';
    const modKey = await getBrowserModKey(editor.root);

    await editor.selection.collapse({ offset: 0, path: [0, 0] });
    await editor.focus();
    await page.keyboard.press(`${modKey}+b`);
    await page.keyboard.press(`${modKey}+i`);
    await page.keyboard.press(`${modKey}+u`);
    await page.keyboard.insertText(markedText);

    await expect
      .poll(async () => getPaginationLeafStyleForText(editor.root, markedText))
      .toEqual({
        hasUnderline: true,
        isBold: true,
        isItalic: true,
      });

    await editor.selection.collapse({ offset: 0, path: [1, 0] });
    await editor.focus();
    await page.keyboard.press(`${modKey}+Alt+1`);
    await expect
      .poll(async () => getPaginationElementTag(editor.root, '1'))
      .toBe('h1');

    await page.keyboard.press(`${modKey}+Alt+2`);
    await expect
      .poll(async () => getPaginationElementTag(editor.root, '1'))
      .toBe('h2');

    await page.keyboard.press(`${modKey}+Alt+3`);
    await expect
      .poll(async () => getPaginationElementTag(editor.root, '1'))
      .toBe('h3');
  });

  test('renders a multi-page table as one editable Slate subtree', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination table fragments'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await page.getByRole('switch', { name: 'Debug' }).click();

    const tablePathAttribute = await editor.root
      .locator('[data-testid="pagination-rich-table"]')
      .getAttribute('data-slate-path');

    expect(tablePathAttribute).toBeTruthy();

    const tablePath = Number(tablePathAttribute);

    await editor.selection.collapse({
      path: [tablePath, 28, 1, 0],
      offset: 'Path-aware cell 29'.length,
    });

    await expect
      .poll(async () => {
        const nextProof = await getPaginationTableProof(editor.root);

        return {
          cellsMatchRows:
            nextProof.mountedCellCount === nextProof.mountedRowCount * 3,
          duplicatePaths: nextProof.duplicatePaths,
          hasMountedWindow:
            nextProof.mountedRowCount > 0 && nextProof.mountedRowCount < 240,
          rowsFramed: nextProof.rowFrameIndexes.every((index) => index >= 0),
          tableCount: nextProof.tableCount,
          visibleRowsMatch:
            nextProof.visibleRowCount === nextProof.mountedRowCount,
        };
      })
      .toEqual({
        cellsMatchRows: true,
        duplicatePaths: [],
        hasMountedWindow: true,
        rowsFramed: true,
        tableCount: 1,
        visibleRowsMatch: true,
      });
  });

  test('materializes table rows only for the selected row count', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination table stress controls'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await expect
      .poll(async () => getPaginationTableProof(editor.root))
      .toEqual(expect.objectContaining({ tableCount: 1 }));

    const tablePathAttribute = await editor.root
      .locator('[data-testid="pagination-rich-table"]')
      .getAttribute('data-slate-path');

    expect(tablePathAttribute).toBeTruthy();

    const tablePath = Number(tablePathAttribute);

    await editor.selection.collapse({
      path: [tablePath, 28, 1, 0],
      offset: 'Path-aware cell 29'.length,
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationTableProof(editor.root);

        return {
          boundedWindow:
            proof.mountedRowCount > 0 && proof.mountedRowCount < 240,
          cellsMatchRows: proof.mountedCellCount === proof.mountedRowCount * 3,
          visibleRowsMatch: proof.visibleRowCount === proof.mountedRowCount,
        };
      })
      .toEqual({
        boundedWindow: true,
        cellsMatchRows: true,
        visibleRowsMatch: true,
      });

    await page.getByLabel('Rows').fill('96');

    await expect
      .poll(async () => {
        const proof = await getPaginationTableProof(editor.root);

        return {
          boundedWindow:
            proof.mountedRowCount > 0 && proof.mountedRowCount < 96,
          cellsMatchRows: proof.mountedCellCount === proof.mountedRowCount * 3,
          visibleRowsMatch: proof.visibleRowCount === proof.mountedRowCount,
        };
      })
      .toEqual({
        boundedWindow: true,
        cellsMatchRows: true,
        visibleRowsMatch: true,
      });
  });

  test('edits a visually second-page table cell without splitting the table DOM', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination table editing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    const tablePath = 47;
    const targetText = 'Path-aware cell 29';

    await editor.selection.collapse({
      path: [tablePath, 28, 1, 0],
      offset: targetText.length,
    });
    await editor.focus();
    await page.keyboard.insertText(' edited');

    await expect
      .poll(async () => editor.get.modelText())
      .toContain(`${targetText} edited`);

    const proof = await getPaginationTableProof(editor.root);

    expect(proof.tableCount).toBe(1);
    expect(proof.duplicatePaths).toEqual([]);
  });

  test('copies a selection across table rows split by a page boundary', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination table copy'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    const tablePathAttribute = await editor.root
      .locator('[data-testid="pagination-rich-table"]')
      .getAttribute('data-slate-path');

    expect(tablePathAttribute).toBeTruthy();

    const tablePath = Number(tablePathAttribute);

    await editor.selection.select({
      anchor: { path: [tablePath, 24, 0, 0], offset: 0 },
      focus: { path: [tablePath, 25, 2, 0], offset: 'Fragment 26'.length },
    });
    await editor.focus();
    await editor.root.press('ControlOrMeta+C');

    const text = await editor.clipboard.readText();

    expect(text).toContain('Row 25');
    expect(text).toContain('Fragment 26');

    const proof = await getPaginationTableProof(editor.root);

    expect(proof.tableCount).toBe(1);
    expect(proof.duplicatePaths).toEqual([]);
  });

  test('does not jump to the table when clicking unfocused first-page margins and corners', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination page-margin hit testing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      query: { debug: 'true' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    const matrix = await getFirstPageMarginClickMatrix(editor.root);

    expect(matrix).toBeTruthy();
    expect(matrix!.targets.length).toBeGreaterThanOrEqual(12);
    expect(matrix!.firstPageTopLevelPaths.length).toBeGreaterThan(0);
    expect(matrix!.firstPageTopLevelPaths).not.toContain(
      matrix!.tableTopLevelPath
    );

    for (const target of matrix!.targets) {
      await editor.selection.collapse({
        path: [0, 0],
        offset: 0,
      });
      await page.getByLabel('Rows').focus();
      await page.mouse.click(target.x, target.y);

      await expect
        .poll(
          async () => {
            const selection = await editor.selection.get();
            const selectedTopLevelPaths = [
              selection?.anchor.path[0],
              selection?.focus.path[0],
            ];
            const scrollTop = await editor.root.evaluate(
              (element: HTMLElement) => {
                const viewport =
                  element.ownerDocument.querySelector<HTMLElement>(
                    '[data-testid="pagination-viewport"]'
                  );

                return viewport?.scrollTop ?? null;
              }
            );

            return {
              jumpedToTable: selectedTopLevelPaths.includes(
                matrix!.tableTopLevelPath
              ),
              leftFirstPage: selectedTopLevelPaths.some(
                (path) =>
                  path !== undefined &&
                  !matrix!.firstPageTopLevelPaths.includes(path)
              ),
              scrollJumped:
                scrollTop === null ||
                Math.abs(scrollTop - matrix!.initialScrollTop) > 1,
            };
          },
          { message: target.name }
        )
        .toEqual({
          jumpedToTable: false,
          leftFirstPage: false,
          scrollJumped: false,
        });
    }
  });

  test('does not jump to the table when clicking a fresh single-layout page corner', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for fresh pagination page-corner hit testing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      query: { debug: 'true', page_layout: 'single' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    const matrix = await getFirstPageMarginClickMatrix(editor.root);

    expect(matrix).toBeTruthy();

    const target = matrix!.targets.find(
      (candidate) => candidate.name === 'top-right-corner'
    );

    expect(target).toBeTruthy();
    await expect.poll(async () => editor.selection.get()).toBeNull();

    await page.getByLabel('Rows').focus();
    await page.mouse.click(target!.x, target!.y);

    await expect
      .poll(async () => {
        const selection = await editor.selection.get();
        const selectedTopLevelPaths = [
          selection?.anchor.path[0],
          selection?.focus.path[0],
        ];
        const scrollTop = await editor.root.evaluate((element: HTMLElement) => {
          const viewport = element.ownerDocument.querySelector<HTMLElement>(
            '[data-testid="pagination-viewport"]'
          );

          return viewport?.scrollTop ?? null;
        });

        return {
          jumpedToTable: selectedTopLevelPaths.includes(
            matrix!.tableTopLevelPath
          ),
          leftFirstPage: selectedTopLevelPaths.some(
            (path) =>
              path !== undefined &&
              !matrix!.firstPageTopLevelPaths.includes(path)
          ),
          scrollJumped:
            scrollTop === null ||
            Math.abs(scrollTop - matrix!.initialScrollTop) > 1,
        };
      })
      .toEqual({
        jumpedToTable: false,
        leftFirstPage: false,
        scrollJumped: false,
      });
  });

  test('does not jump to the table when clicking a focused single-layout page corner', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for focused pagination page-corner hit testing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      query: { debug: 'true', page_layout: 'single' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    const matrix = await getFirstPageMarginClickMatrix(editor.root);

    expect(matrix).toBeTruthy();

    const target = matrix!.targets.find(
      (candidate) => candidate.name === 'top-right-corner'
    );

    expect(target).toBeTruthy();

    await editor.selection.collapse({
      path: [0, 0],
      offset: 0,
    });
    await editor.focus();
    await page.mouse.click(target!.x, target!.y);

    await expect
      .poll(async () => {
        const selection = await editor.selection.get();
        const selectedTopLevelPaths = [
          selection?.anchor.path[0],
          selection?.focus.path[0],
        ];
        const scrollTop = await editor.root.evaluate((element: HTMLElement) => {
          const viewport = element.ownerDocument.querySelector<HTMLElement>(
            '[data-testid="pagination-viewport"]'
          );

          return viewport?.scrollTop ?? null;
        });

        return {
          jumpedToTable: selectedTopLevelPaths.includes(
            matrix!.tableTopLevelPath
          ),
          leftFirstPage: selectedTopLevelPaths.some(
            (path) =>
              path !== undefined &&
              !matrix!.firstPageTopLevelPaths.includes(path)
          ),
          scrollJumped:
            scrollTop === null ||
            Math.abs(scrollTop - matrix!.initialScrollTop) > 1,
        };
      })
      .toEqual({
        jumpedToTable: false,
        leftFirstPage: false,
        scrollJumped: false,
      });
  });

  test('places blurred single-layout table row side-margin clicks on the clicked row', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for blurred pagination margin hit testing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      query: { debug: 'true', page_layout: 'single' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    const tablePathAttribute = await editor.root
      .locator('[data-testid="pagination-rich-table"]')
      .getAttribute('data-slate-path');

    expect(tablePathAttribute).toBeTruthy();

    const tablePath = Number(tablePathAttribute);

    await editor.selection.collapse({
      path: [tablePath, 238, 2, 0],
      offset: 'Fragment 239'.length,
    });

    const targets = await getVisiblePaginationTableRowMarginTargets(
      editor.root,
      238
    );

    expect(targets).toBeTruthy();

    for (const target of [targets!.left, targets!.right]) {
      await page.getByLabel('Rows').focus();
      await page.mouse.click(target.x, target.y);

      await expect
        .poll(async () => editor.selection.get())
        .toEqual({
          anchor: {
            offset: target.expectedOffset,
            path: target.expectedPath,
          },
          focus: {
            offset: target.expectedOffset,
            path: target.expectedPath,
          },
        });
    }
  });

  test('does not jump to the table when clicking current visible page corners', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for current pagination page-corner hit testing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      query: { debug: 'true', page_layout: 'single' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    await editor.selection.collapse({
      path: [0, 0],
      offset: 0,
    });
    const matrix = await getVisiblePaginationTablePageCornerMatrix(editor.root);

    expect(matrix).toBeTruthy();

    for (const target of matrix!.targets) {
      await page.getByLabel('Rows').focus();
      await page.mouse.click(target.x, target.y);

      await expect
        .poll(
          async () => {
            const selection = await editor.selection.get();
            const selectedTopLevelPaths = [
              selection?.anchor.path[0],
              selection?.focus.path[0],
            ];
            const scrollTop = await editor.root.evaluate(
              (element: HTMLElement) => {
                const viewport =
                  element.ownerDocument.querySelector<HTMLElement>(
                    '[data-testid="pagination-viewport"]'
                  );

                return viewport?.scrollTop ?? null;
              }
            );

            return {
              jumpedToTable: selectedTopLevelPaths.includes(
                matrix!.tableTopLevelPath
              ),
              scrollJumped:
                scrollTop === null ||
                Math.abs(scrollTop - matrix!.initialScrollTop) > 1,
            };
          },
          { message: target.name }
        )
        .toEqual({
          jumpedToTable: false,
          scrollJumped: false,
        });
    }
  });

  test('places selection on an adjacent paragraph when clicking the paragraph gap', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination editing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single' },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const firstBlockText = (await editor.get.modelBlockTexts())[0]!;
    const point = await getParagraphGapPoint(editor.root, '0', '1');

    expect(point).toBeTruthy();

    await page.mouse.click(point!.x, point!.y);

    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: firstBlockText.length },
        focus: { path: [0, 0], offset: firstBlockText.length },
      });
  });

  test('places selection at the native blank-tail caret when clicking the paragraph tail', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination editing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const firstBlockText = (await editor.get.modelBlockTexts())[0]!;
    const point = await getParagraphBlankTailPoint(editor.root, '0');

    expect(point).toBeTruthy();

    await page.mouse.click(point!.x, point!.y);

    const selection = await expectCollapsedModelMatchesDOMSelection(editor);

    expect(selection.anchor.path).toEqual([0, 0]);
    expect(selection.anchor.offset).toBeGreaterThan(0);
    expect(selection.anchor.offset).toBeLessThanOrEqual(firstBlockText.length);
  });

  test('places selection at wrapped line end when clicking the right page margin', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination right-margin hit testing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const blockTexts = await editor.get.blockTexts();
    const setupBlockText = blockTexts[1] ?? '';
    const point = await getVisiblePaginationRightLineMarginTarget(editor.root);
    const targetBlockText = point ? blockTexts[Number(point.blockPath)]! : '';

    expect(point).toBeTruthy();

    await editor.selection.collapse({
      path: [1, 0],
      offset: Math.min(4, setupBlockText.length),
    });
    await editor.focus();
    await page.mouse.click(point!.x, point!.y);

    const selection = await expectCollapsedModelMatchesDOMSelection(editor);

    expect(selection.anchor.path).toEqual([Number(point!.blockPath), 0]);
    expect(selection.anchor.offset).toBeGreaterThan(0);
    expect(selection.anchor.offset).toBeLessThanOrEqual(targetBlockText.length);
  });

  test('places selection at wrapped line starts when clicking the left paragraph gutter', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination left-margin hit testing'
    );

    await page.setViewportSize({ height: 814, width: 1994 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    const targets = await getVisiblePaginationWrappedLineMarginTargets(
      editor.root,
      'left'
    );

    expect(targets.length).toBeGreaterThanOrEqual(3);

    for (const target of targets) {
      await editor.selection.collapse({
        path: [0, 0],
        offset: 0,
      });
      await editor.focus();
      await page.mouse.click(target.x, target.y);

      await expect
        .poll(async () => ({
          activeIsEditor: await editor.root.evaluate(
            (element) => element.ownerDocument.activeElement === element
          ),
          nativeSelection: await editor.root.evaluate((element) => {
            const selection = document.getSelection();

            return {
              belongsToEditor: Boolean(
                selection?.anchorNode && element.contains(selection.anchorNode)
              ),
              isCollapsed: selection?.isCollapsed ?? null,
            };
          }),
          selection: await editor.selection.get(),
        }))
        .toEqual({
          activeIsEditor: true,
          nativeSelection: {
            belongsToEditor: true,
            isCollapsed: true,
          },
          selection: {
            anchor: {
              path: [Number(target.blockPath), 0],
              offset: target.expectedOffset,
            },
            focus: {
              path: [Number(target.blockPath), 0],
              offset: target.expectedOffset,
            },
          },
        });
    }
  });

  test('autoscrolls pagination viewport while drag-selecting near vertical edges', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination drag-selection autoscroll'
    );
    test.skip(
      process.env.SLATE_PAGINATION_AUTOSCROLL_PROOF !== '1',
      'Quarantined from full gates: native pagination drag autoscroll is load-sensitive in Playwright; run the opt-in single-worker pagination lane instead'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    for (const direction of ['bottom', 'top'] as const) {
      const target = await getPaginationDragAutoscrollTarget(
        editor.root,
        direction
      );

      expect(target).toBeTruthy();

      await page.mouse.move(target!.start.x, target!.start.y);
      await page.mouse.down();
      try {
        await page.mouse.move(target!.edge.x, target!.edge.y, { steps: 20 });

        const readAutoscrollProof = () =>
          editor.root.evaluate(
            (element: HTMLElement, args) => {
              const viewport = element.ownerDocument.querySelector<HTMLElement>(
                '[data-testid="pagination-viewport"]'
              );
              const selection = element.ownerDocument.getSelection();

              return {
                expanded: Boolean(selection && !selection.isCollapsed),
                scrolled:
                  args.direction === 'top'
                    ? (viewport?.scrollTop ?? 0) < args.initialScrollTop - 8
                    : (viewport?.scrollTop ?? 0) > args.initialScrollTop + 8,
              };
            },
            { direction, initialScrollTop: target!.initialScrollTop }
          );

        for (let edgeMoveCount = 0; edgeMoveCount < 40; edgeMoveCount++) {
          const proof = await readAutoscrollProof();

          if (proof.expanded && proof.scrolled) {
            break;
          }

          const edgeJitter =
            edgeMoveCount % 2 === 0 ? 0 : direction === 'top' ? 2 : -2;

          await page.mouse.move(target!.edge.x, target!.edge.y + edgeJitter);
          await page.waitForTimeout(50);
        }

        await expect.poll(readAutoscrollProof).toEqual({
          expanded: true,
          scrolled: true,
        });
      } finally {
        await page.mouse.up();
      }
    }
  });

  test('keeps typed trailing spaces at the paragraph end', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination editing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const firstBlockText = (await editor.get.blockTexts())[0]!;

    await editor.selection.collapse({
      path: [0, 0],
      offset: firstBlockText.length,
    });
    await editor.focus();
    await page.keyboard.insertText('   ');

    await expect
      .poll(async () => (await editor.get.blockTexts())[0])
      .toBe(`${firstBlockText}   `);
    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: { path: [0, 0], offset: firstBlockText.length + 3 },
        focus: { path: [0, 0], offset: firstBlockText.length + 3 },
      });
    await expect
      .poll(async () =>
        editor.root.evaluate(() => {
          const firstText = document.querySelector('[data-slate-path="0,0"]');
          const leaves = Array.from(
            firstText?.querySelectorAll('[data-slate-leaf]') ?? []
          );
          const lastLeaf = leaves.at(-1);

          return lastLeaf?.textContent?.endsWith('   ') ?? false;
        })
      )
      .toBe(true);
  });

  test('keeps projected block offsets when page-level virtualization is active', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination DOM strategy fallback'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });

    await page.getByLabel('DOM strategy').selectOption('virtualized');
    await page.getByLabel('Page overscan').fill('0');

    await expect
      .poll(async () =>
        editor.root.evaluate(() => {
          const rowCount = document.querySelectorAll(
            '[data-slate-dom-strategy-virtual-row="true"]'
          ).length;
          const boundaryCount = document.querySelectorAll(
            '[data-slate-dom-strategy-virtualized-boundary="true"]'
          ).length;

          return (
            document.querySelector(
              '[data-slate-dom-strategy-virtualizer="true"]'
            ) != null &&
            rowCount > 0 &&
            boundaryCount > 0
          );
        })
      )
      .toBe(true);

    await expect
      .poll(async () => {
        const leadingBoxes = await getLeadingElementBoxes(editor.root, 4);

        return (
          leadingBoxes.length === 4 &&
          leadingBoxes
            .slice(1)
            .every((box, index) => box.top > leadingBoxes[index]!.top + 8)
        );
      })
      .toBe(true);
  });

  test('loads the direct virtualized pagination route without replaying the stress fixture', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination virtualized startup latency'
    );

    await page.setViewportSize({ height: 900, width: 720 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });
    const proof = await getPaginationVirtualizedTableProof(editor.root);
    const startup = await editor.root.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;
      const metaText =
        document.querySelector('.slate-pagination-meta')?.textContent ?? '';

      return {
        appAfterDOMContentLoadedMs: nav
          ? performance.now() - nav.domContentLoadedEventEnd
          : performance.now(),
        composeMs: Number(metaText.match(/compose ([\d.]+)ms/)?.[1] ?? 0),
        domContentLoadedMs: nav?.domContentLoadedEventEnd ?? null,
        totalMs: performance.now(),
      };
    });

    await testInfo.attach('pagination-virtualized-startup', {
      body: JSON.stringify({ proof, startup }, null, 2),
      contentType: 'application/json',
    });

    expect(proof.pageVirtualizationEnabled).toBe(true);
    expect(proof.stressPageCount).toBeGreaterThanOrEqual(900);
    expect(proof.pageTotal).toBeGreaterThanOrEqual(950);
    expect(proof.pageTotal).toBeLessThanOrEqual(1250);
    expect(proof.totalElementCount).toBeLessThan(1000);
    expect(proof.pageSurfaceCount).toBeLessThanOrEqual(8);
    expect(startup.appAfterDOMContentLoadedMs).toBeLessThanOrEqual(5000);
  });

  test('switches from staged to virtualized without replaying stress nodes one by one', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination virtualized dropdown latency'
    );

    await page.setViewportSize({ height: 900, width: 720 });

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
      },
    });
    const before = await getPaginationVirtualizedTableProof(editor.root);

    expect(before.stressPageCount).toBe(0);
    expect(before.pageVirtualizationEnabled).toBe(false);

    const startedAt = Date.now();

    await page.getByLabel('DOM strategy').selectOption('virtualized');

    const selectReturnedMs = Date.now() - startedAt;
    let proof = await getPaginationVirtualizedTableProof(editor.root);

    await expect
      .poll(async () => {
        proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1000,
          boundedPages: proof.pageSurfaceCount <= 8,
          pageTotalInRange: proof.pageTotal >= 950 && proof.pageTotal <= 1250,
          stressPagesConfigured: proof.stressPageCount >= 900,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        pageTotalInRange: true,
        stressPagesConfigured: true,
        virtualized: true,
      });

    const readyMs = Date.now() - startedAt;

    await testInfo.attach('pagination-virtualized-dropdown-startup', {
      body: JSON.stringify(
        { before, proof, readyMs, selectReturnedMs },
        null,
        2
      ),
      contentType: 'application/json',
    });

    expect(selectReturnedMs).toBeLessThanOrEqual(5000);
    expect(readyMs).toBeLessThanOrEqual(5000);
  });

  test('moves the cursor between the first two virtualized pagination blocks on click', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for virtualized pagination hit testing'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        virtualized: true,
      });

    const firstTarget = await getVisiblePaginationTextTargetByPath(
      editor.root,
      '0'
    );
    const secondTarget = await getVisiblePaginationTextTargetByPath(
      editor.root,
      '1'
    );

    expect(firstTarget).toBeTruthy();
    expect(secondTarget).toBeTruthy();

    await page.mouse.click(firstTarget!.x, firstTarget!.y);
    await expect
      .poll(async () => ({
        domPath: await getDOMSelectionTextPath(editor.root),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        domPath: '0,0',
        selection: expect.objectContaining({
          anchor: expect.objectContaining({ path: [0, 0] }),
          focus: expect.objectContaining({ path: [0, 0] }),
        }),
      });

    await page.mouse.click(secondTarget!.x, secondTarget!.y);
    await expect
      .poll(async () => ({
        domPath: await getDOMSelectionTextPath(editor.root),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        domPath: '1,0',
        selection: expect.objectContaining({
          anchor: expect.objectContaining({ path: [1, 0] }),
          focus: expect.objectContaining({ path: [1, 0] }),
        }),
      });
  });

  test('keeps virtualized pagination text aligned when a paragraph becomes selected', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for virtualized pagination selected text alignment'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });

    const before = await getPaginationTextAlignmentByPath(editor.root, '1');
    const target = await getVisiblePaginationTextTargetByPath(editor.root, '1');

    expect(before).toEqual(
      expect.objectContaining({
        firstLeafPosition: 'absolute',
      })
    );
    expect(target).toBeTruthy();

    await page.mouse.click(target!.x, target!.y);

    await expect
      .poll(async () => {
        const after = await getPaginationTextAlignmentByPath(editor.root, '1');
        const lineRectsStable =
          !!before &&
          !!after &&
          before.lineRects.length === after.lineRects.length &&
          before.lineRects.every((beforeRect, index) => {
            const afterRect = after.lineRects[index];

            return (
              !!afterRect &&
              Math.abs(afterRect.left - beforeRect.left) <= 0.5 &&
              Math.abs(afterRect.right - beforeRect.right) <= 0.5 &&
              Math.abs(afterRect.top - beforeRect.top) <= 0.5
            );
          });

        return {
          aligned:
            !!before &&
            !!after &&
            Math.abs(after.firstLeafLeft - before.firstLeafLeft) <= 0.5,
          lineRectsStable,
          nativeFlow: after?.firstLeafPosition === 'static',
          wrapWidthPreserved:
            !!before &&
            !!after &&
            Math.abs(
              after.blockWidth - after.paddingLeft - before.blockWidth
            ) <= 0.5,
        };
      })
      .toEqual({
        aligned: true,
        lineRectsStable: true,
        nativeFlow: true,
        wrapWidthPreserved: true,
      });
  });

  test('selects projected pagination words on native double click', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for native word selection in projected pagination text'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'staged' },
      ready: {
        editor: 'visible',
      },
    });

    await editor.scenario.run(
      'pagination-projected-native-word-double-click',
      [
        {
          kind: 'doubleClickTextOffset',
          label: 'native-select-projected-word',
          offset: 4,
          path: [0, 0],
          selectedText: 'Premirror',
        },
        {
          kind: 'assertSelectedText',
          label: 'assert-native-selected-projected-word',
          text: 'Premirror',
        },
        {
          kind: 'assertWindowSelectionText',
          label: 'assert-window-selected-projected-word',
          text: 'Premirror',
        },
        {
          kind: 'assertSelection',
          label: 'assert-model-selected-projected-word',
          selection: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 'Premirror'.length, path: [0, 0] },
          },
        },
      ],
      {
        metadata: {
          capabilities: [
            'dom-selection',
            'native-word-selection',
            'projected-pagination',
          ],
          platform: testInfo.project.name,
          transport: 'native-click-and-keyboard',
        },
        tracePath: testInfo.outputPath(
          'pagination-projected-native-word-double-click.json'
        ),
      }
    );
  });

  test('selects virtualized projected pagination words on native double click', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for native word selection in virtualized pagination text'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });

    await editor.scenario.run(
      'pagination-virtualized-projected-native-word-double-click',
      [
        {
          kind: 'doubleClickTextOffset',
          label: 'native-select-virtualized-projected-word',
          offset: 4,
          path: [0, 0],
          selectedText: 'Premirror',
        },
        {
          kind: 'assertSelectedText',
          label: 'assert-native-selected-virtualized-projected-word',
          text: 'Premirror',
        },
        {
          kind: 'assertWindowSelectionText',
          label: 'assert-window-selected-virtualized-projected-word',
          text: 'Premirror',
        },
        {
          kind: 'assertSelection',
          label: 'assert-model-selected-virtualized-projected-word',
          selection: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 'Premirror'.length, path: [0, 0] },
          },
        },
      ],
      {
        metadata: {
          capabilities: [
            'dom-selection',
            'native-word-selection',
            'projected-pagination',
            'page-virtualization',
          ],
          platform: testInfo.project.name,
          transport: 'native-click-and-keyboard',
        },
        tracePath: testInfo.outputPath(
          'pagination-virtualized-projected-native-word-double-click.json'
        ),
      }
    );
  });

  test('selects virtualized pagination text when dragging from the page line margin', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for virtualized pagination margin hit testing'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        virtualized: true,
      });

    const startTarget = await getVisiblePaginationLineMarginTargetByPath(
      editor.root,
      '0'
    );
    const endTarget = await getVisiblePaginationTextTargetByPath(
      editor.root,
      '2'
    );

    expect(startTarget).toBeTruthy();
    expect(endTarget).toBeTruthy();

    await page.mouse.move(startTarget!.x, startTarget!.y);
    await page.mouse.down();
    await page.mouse.move(endTarget!.x, endTarget!.y, { steps: 30 });
    await page.mouse.up();

    await expect
      .poll(async () => {
        const domSelectionText = await page.evaluate(
          () => document.getSelection()?.toString() ?? ''
        );
        const selection = await editor.selection.get();
        const focusBlock = selection?.focus.path[0] ?? null;

        return {
          anchorAtDocumentStart:
            selection?.anchor.path.join(',') === '0,0' &&
            selection.anchor.offset === 0,
          expanded:
            !!selection &&
            (selection.anchor.path.join(',') ===
              selection.focus.path.join(',') &&
              selection.anchor.offset === selection.focus.offset) === false,
          focusInVisiblePageText:
            typeof focusBlock === 'number' &&
            focusBlock >= 2 &&
            focusBlock < 20,
          includesDraggedText: domSelectionText.includes(
            'Premirror Milestone 1 test document'
          ),
          notVirtualTail: focusBlock !== 3020,
        };
      })
      .toEqual({
        anchorAtDocumentStart: true,
        expanded: true,
        focusInVisiblePageText: true,
        includesDraggedText: true,
        notVirtualTail: true,
      });
  });

  test('places virtualized pagination selection at line start from the page margin', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for virtualized pagination margin focus ownership'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        virtualized: true,
      });

    const textTarget = await getVisiblePaginationTextTargetByPath(
      editor.root,
      '1'
    );
    const marginTarget = await getVisiblePaginationLineMarginTargetByPath(
      editor.root,
      '0'
    );

    expect(textTarget).toBeTruthy();
    expect(marginTarget).toBeTruthy();

    await page.mouse.click(textTarget!.x, textTarget!.y);
    await expect
      .poll(async () => (await editor.selection.get())?.anchor.path ?? null)
      .toEqual([1, 0]);

    await page.mouse.click(marginTarget!.x, marginTarget!.y);

    await expect
      .poll(async () => ({
        activeIsEditor: await editor.root.evaluate(
          (element) => element.ownerDocument.activeElement === element
        ),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        activeIsEditor: true,
        selection: {
          anchor: { path: [Number(marginTarget!.blockPath), 0], offset: 0 },
          focus: { path: [Number(marginTarget!.blockPath), 0], offset: 0 },
        },
      });
  });

  test('places virtualized pagination selection at wrapped line ends from the right page margin', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for virtualized pagination right-margin hit testing'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        virtualized: true,
      });

    await editor.selection.collapse({
      path: [0, 0],
      offset: 0,
    });
    await editor.focus();

    const targets = await getVisiblePaginationWrappedLineMarginTargets(
      editor.root,
      'right'
    );
    expect(targets.length).toBeGreaterThanOrEqual(3);

    for (const target of targets.slice(0, 3)) {
      await editor.selection.collapse({
        path: [0, 0],
        offset: 0,
      });
      await editor.focus();
      await page.mouse.click(target.x, target.y);

      await expect
        .poll(async () => ({
          activeIsEditor: await editor.root.evaluate(
            (element) => element.ownerDocument.activeElement === element
          ),
          nativeSelection: await editor.root.evaluate(() => {
            const selection = document.getSelection();

            return {
              collapsed: selection?.isCollapsed ?? false,
              hasAnchorText: Boolean(selection?.anchorNode?.textContent),
            };
          }),
          caretAtLineEnd: await getCollapsedCaretRect(editor.root).then(
            (caretRect) =>
              !!caretRect &&
              Math.abs(caretRect.left - target.lineRect.right) <= 12 &&
              Math.abs(caretRect.top - target.lineRect.top) <= 8
          ),
          selection: await editor.selection.get(),
        }))
        .toEqual({
          activeIsEditor: true,
          caretAtLineEnd: true,
          nativeSelection: {
            collapsed: true,
            hasAnchorText: true,
          },
          selection: {
            anchor: {
              path: [Number(target.blockPath), 0],
              offset: target.expectedOffset,
            },
            focus: {
              path: [Number(target.blockPath), 0],
              offset: target.expectedOffset,
            },
          },
        });
    }
  });

  test('keeps split projected paragraphs stable when clicked, navigated, and edited', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for virtualized pagination click/edit alignment'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        virtualized: true,
      });

    await page
      .locator('[data-testid="pagination-viewport"]')
      .evaluate(async (element) => {
        const viewport = element as HTMLElement;
        const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;

        viewport.scrollTop = Math.round(maxScrollTop * 0.895);
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      });

    const target = await getVisibleProjectedPaginationTextTarget(editor.root);

    expect(target).toBeTruthy();

    const targetPath = Number(target!.blockPath);

    expect(Number.isFinite(targetPath)).toBe(true);

    await page.mouse.click(target!.x, target!.y);

    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        return selection
          ? {
              anchorPath: selection.anchor.path.join(','),
              collapsed:
                selection.anchor.path.join(',') ===
                  selection.focus.path.join(',') &&
                selection.anchor.offset === selection.focus.offset,
            }
          : null;
      })
      .toEqual({
        anchorPath: `${targetPath},0`,
        collapsed: true,
      });

    const clickedSelection = await editor.selection.get();
    const clickedOffset = clickedSelection!.anchor.offset;
    const clickedProof = await getProjectedPaginationTextProof(
      editor.root,
      target!.blockPath
    );

    await testInfo.attach('pagination-projected-click-proof', {
      body: JSON.stringify({ clickedProof, target }, null, 2),
      contentType: 'application/json',
    });

    expect(clickedOffset).toBeGreaterThan(0);
    expect(clickedOffset).toBeLessThan(target!.blockText.length);
    expect(clickedProof.reason).toBe('projection');
    expect(clickedProof.domSync).toBe(null);
    expect(clickedProof.staticLeafCount).toBe(0);
    expect(clickedProof.absoluteLeafCount).toBeGreaterThan(0);
    expect(clickedProof.totalElementCount).toBeLessThan(1400);
    expect(clickedProof.pageSurfaceCount).toBeLessThanOrEqual(8);
    expect(clickedProof.firstVisibleLeafLeft).toBeCloseTo(
      target!.firstLeafLeft,
      0
    );
    expect(clickedProof.firstVisibleLeafTop).toBeCloseTo(
      target!.firstLeafTop,
      0
    );

    await page.keyboard.press('ArrowRight');
    await expect
      .poll(async () => (await editor.selection.get())?.anchor.offset)
      .toBe(clickedOffset + 1);

    await page.keyboard.press('ArrowLeft');
    await expect
      .poll(async () => (await editor.selection.get())?.anchor.offset)
      .toBe(clickedOffset);

    await page.keyboard.insertText('Q');

    const expectedText = `${target!.blockText.slice(
      0,
      clickedOffset
    )}Q${target!.blockText.slice(clickedOffset)}`;

    await expect
      .poll(async () => {
        const proof = await getProjectedPaginationTextProof(
          editor.root,
          target!.blockPath
        );

        return {
          blockText: proof.blockText,
          selection: await editor.selection.get(),
          staticLeafCount: proof.staticLeafCount,
        };
      })
      .toEqual({
        blockText: expectedText,
        selection: {
          anchor: { offset: clickedOffset + 1, path: [targetPath, 0] },
          focus: { offset: clickedOffset + 1, path: [targetPath, 0] },
        },
        staticLeafCount: 0,
      });
  });

  test('survives a rows=800 virtualized real-user editing journey', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for combined virtualized pagination editing'
    );

    await page.setViewportSize({ height: 637, width: 1533 });

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', rows: 800, strategy: 'virtualized' },
      ready: {
        editor: 'visible',
      },
    });
    const assertHealthy = async () => {
      await expect
        .poll(async () => {
          const proof = await getPaginationVirtualizedTableProof(editor.root);

          return {
            boundedDOM: proof.totalElementCount < 1400,
            boundedPages: proof.pageSurfaceCount <= 8,
            virtualized: proof.pageVirtualizationEnabled,
          };
        })
        .toEqual({
          boundedDOM: true,
          boundedPages: true,
          virtualized: true,
        });
    };

    await assertHealthy();

    const modKey = await getBrowserModKey(editor.root);
    const firstTarget = await getVisiblePaginationTextTargetByPath(
      editor.root,
      '1'
    );

    expect(firstTarget).toBeTruthy();

    await page.mouse.click(firstTarget!.x, firstTarget!.y);
    await expect
      .poll(async () => (await editor.selection.get())?.anchor.path ?? null)
      .toEqual([1, 0]);

    const firstToken = ' journey-alpha';

    await page.keyboard.type(firstToken);
    await expect(editor.root).toContainText(firstToken);
    await assertHealthy();

    await page.keyboard.press(`${modKey}+Z`);
    await expect(editor.root).not.toContainText(firstToken);
    await page.keyboard.press(
      modKey === 'Meta' ? `${modKey}+Shift+Z` : `${modKey}+Y`
    );
    await expect(editor.root).toContainText(firstToken);

    const secondToken = 'journey-after-enter';

    await page.keyboard.press('Enter');
    await page.keyboard.type(secondToken);
    await expect(editor.root).toContainText(secondToken);
    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        return selection
          ? {
              collapsed:
                selection.anchor.path.join(',') ===
                  selection.focus.path.join(',') &&
                selection.anchor.offset === selection.focus.offset,
              textPath: selection.anchor.path,
            }
          : null;
      })
      .toEqual({
        collapsed: true,
        textPath: [2, 0],
      });
    await assertHealthy();

    const startTarget = await getVisiblePaginationLineMarginTargetByPath(
      editor.root,
      '0'
    );
    const endTarget =
      (await getVisiblePaginationTextTargetByPath(editor.root, '3')) ??
      (await getVisiblePaginationTextTargetByPath(editor.root, '2'));

    expect(startTarget).toBeTruthy();
    expect(endTarget).toBeTruthy();

    await page.mouse.move(startTarget!.x, startTarget!.y);
    await page.mouse.down();
    await page.mouse.move(endTarget!.x + 80, endTarget!.y, { steps: 20 });
    await page.mouse.up();

    await expect
      .poll(async () => {
        const selection = await editor.selection.get();
        const selectedText = await page.evaluate(
          () => document.getSelection()?.toString() ?? ''
        );

        return {
          expanded:
            !!selection &&
            (selection.anchor.path.join(',') ===
              selection.focus.path.join(',') &&
              selection.anchor.offset === selection.focus.offset) === false,
          selected: selectedText.includes('Premirror Milestone 1'),
        };
      })
      .toEqual({
        expanded: true,
        selected: true,
      });
    await assertHealthy();

    const viewport = page.locator('[data-testid="pagination-viewport"]');
    const scrollStartedAt = await page.evaluate(() => performance.now());

    await viewport.evaluate(async (element) => {
      const viewport = element as HTMLElement;

      viewport.scrollTop = Math.round(
        (viewport.scrollHeight - viewport.clientHeight) * 0.55
      );
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
    });

    const sample = await getPaginationFastScrollSample(
      editor.root,
      scrollStartedAt
    );

    expect(sample.totalElementCount).toBeLessThan(1400);
    expect(sample.pageSurfaceCount).toBeLessThanOrEqual(10);
    expect(sample.visibleText.length).toBeGreaterThan(0);
    expect(sample.hitVisibleContentCount).toBeGreaterThan(0);

    const scrolledTarget = await getVisiblePaginationTextTarget(editor.root);

    expect(scrolledTarget).toBeTruthy();

    await page.mouse.click(scrolledTarget!.x, scrolledTarget!.y);

    await expect
      .poll(async () => {
        const selection = await editor.selection.get();

        return selection
          ? {
              collapsed:
                selection.anchor.path.join(',') ===
                  selection.focus.path.join(',') &&
                selection.anchor.offset === selection.focus.offset,
              path: selection.anchor.path,
            }
          : null;
      })
      .toEqual({
        collapsed: true,
        path: [Number(scrolledTarget!.blockPath), 0],
      });
    await assertHealthy();
  });

  test('imports deferred virtualized table input after selection moves', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for deferred native input repair target capture'
    );

    await page.setViewportSize({ height: 900, width: 720 });

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });
    const tablePathAttribute = await editor.root
      .locator('[data-testid="pagination-rich-table"]')
      .getAttribute('data-slate-path');

    expect(tablePathAttribute).toBeTruthy();

    const tablePath = Number(tablePathAttribute);
    const tableCellText = 'Path-aware cell 120';

    await page.getByLabel('DOM strategy').selectOption('virtualized');
    await page.getByLabel('Page overscan').fill('4');

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 3600,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        virtualized: true,
      });

    await editor.selection.collapse({
      path: [tablePath, 119, 1, 0],
      offset: tableCellText.length,
    });
    await editor.focus();

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          hasRow120: proof.hasRow120,
          mountedCellCount: proof.mountedCellCount <= 660,
          mountedRowCount: proof.mountedRowCount <= 220,
        };
      })
      .toEqual({
        hasRow120: true,
        mountedCellCount: true,
        mountedRowCount: true,
      });

    await page.keyboard.insertText('x');
    await editor.selection.collapse({ path: [0, 0], offset: 0 });

    await expect
      .poll(async () => ({
        modelHasTableText: (await editor.get.modelText()).includes(
          `${tableCellText}x`
        ),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        modelHasTableText: true,
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
      });
  });

  test('keeps a 1000-page virtualized document with a 10-page table bounded', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination page virtualization stress'
    );

    const editor = await openExample(page, 'slate/pagination', {
      query: { page_overscan: 0, strategy: 'virtualized' },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });

    const tablePath = 47;

    let defaultMountedElementCount = 0;
    let defaultMountedPageCount = 0;

    await expect
      .poll(
        async () => {
          const proof = await getPaginationVirtualizedTableProof(editor.root);
          defaultMountedElementCount = proof.totalElementCount;
          defaultMountedPageCount = proof.pageSurfaceCount;

          return {
            boundedDOM: proof.totalElementCount < 1000,
            boundedPages: proof.pageSurfaceCount <= 8,
            pageTotalInRange: proof.pageTotal >= 950 && proof.pageTotal <= 1250,
            stressPagesConfigured: proof.stressPageCount >= 900,
            tablePagesInRange:
              proof.tablePageCount >= 8 && proof.tablePageCount <= 12,
            virtualized: proof.pageVirtualizationEnabled,
          };
        },
        { timeout: 15_000 }
      )
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        pageTotalInRange: true,
        stressPagesConfigured: true,
        tablePagesInRange: true,
        virtualized: true,
      });

    await page
      .locator('[data-testid="pagination-viewport"]')
      .evaluate(async (element) => {
        const viewport = element as HTMLElement;
        const maxScrollTop = viewport.scrollHeight - viewport.clientHeight;

        viewport.scrollTop = Math.round(maxScrollTop * 0.0125);
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      });

    await expect
      .poll(
        async () => {
          const proof = await getPaginationVirtualizedTableProof(editor.root);

          return {
            boundedDOM: proof.totalElementCount < 1400,
            boundedPages: proof.pageSurfaceCount <= 8,
            boundedRows: proof.mountedRowCount <= 80,
            boundedCells: proof.mountedCellCount <= 240,
          };
        },
        { timeout: 15_000 }
      )
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        boundedRows: true,
        boundedCells: true,
      });

    await page
      .locator('[data-testid="pagination-viewport"]')
      .evaluate((element) => ((element as HTMLElement).scrollTop = 0));

    await expect
      .poll(
        async () => {
          const proof = await getPaginationVirtualizedTableProof(editor.root);

          return proof.mountedRowCount;
        },
        { timeout: 15_000 }
      )
      .toBe(0);

    await page.getByLabel('Page overscan').fill('4');

    await expect
      .poll(
        async () => {
          const proof = await getPaginationVirtualizedTableProof(editor.root);

          return {
            boundedDOM: proof.totalElementCount < 3600,
            mountedMoreDOM:
              proof.totalElementCount > defaultMountedElementCount,
            mountedMorePages: proof.pageSurfaceCount > defaultMountedPageCount,
            mountedPagesStayBounded: proof.pageSurfaceCount <= 14,
            pageOverscan: proof.pageOverscan,
          };
        },
        { timeout: 15_000 }
      )
      .toEqual({
        boundedDOM: true,
        mountedMoreDOM: true,
        mountedMorePages: true,
        mountedPagesStayBounded: true,
        pageOverscan: 4,
      });

    await editor.selection.collapse({
      path: [tablePath, 119, 1, 0],
      offset: 'Path-aware cell 120'.length,
    });
    await editor.focus();
    await expect
      .poll(async () => ({
        domPath: await getDOMSelectionTextPath(editor.root),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        domPath: `${tablePath},119,1,0`,
        selection: {
          anchor: {
            path: [tablePath, 119, 1, 0],
            offset: 'Path-aware cell 120'.length,
          },
          focus: {
            path: [tablePath, 119, 1, 0],
            offset: 'Path-aware cell 120'.length,
          },
        },
      });

    await expect
      .poll(
        async () => {
          const proof = await getPaginationVirtualizedTableProof(editor.root);

          return (
            proof.hasRow120 &&
            typeof proof.firstRowIndex === 'number' &&
            proof.firstRowIndex <= 119 &&
            typeof proof.lastRowIndex === 'number' &&
            proof.lastRowIndex >= 119 &&
            proof.pageSurfaceCount <= 18 &&
            proof.mountedRowCount <= 220 &&
            proof.mountedCellCount <= 660 &&
            proof.totalElementCount < 3600
          );
        },
        { timeout: 15_000 }
      )
      .toBe(true);

    let targetText = 'Path-aware cell 120';

    for (const char of ['x', 'y', 'z']) {
      targetText += char;
      await editor.selection.collapse({
        path: [tablePath, 119, 1, 0],
        offset: targetText.length - 1,
      });
      await editor.focus();
      await expect
        .poll(async () => ({
          domPath: await getDOMSelectionTextPath(editor.root),
          selection: await editor.selection.get(),
        }))
        .toEqual({
          domPath: `${tablePath},119,1,0`,
          selection: {
            anchor: {
              path: [tablePath, 119, 1, 0],
              offset: targetText.length - 1,
            },
            focus: {
              path: [tablePath, 119, 1, 0],
              offset: targetText.length - 1,
            },
          },
        });
      await page.keyboard.insertText(char);

      await expect
        .poll(async () => ({
          modelHasText: (await editor.get.modelText()).includes(targetText),
          selection: await editor.selection.get(),
        }))
        .toEqual({
          modelHasText: true,
          selection: {
            anchor: { path: [tablePath, 119, 1, 0], offset: targetText.length },
            focus: { path: [tablePath, 119, 1, 0], offset: targetText.length },
          },
        });
    }
  });

  test('keeps middle-document typing responsive in a 1000-page virtualized document', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination middle-document typing latency'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await page.getByLabel('DOM strategy').selectOption('virtualized');

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          pageTotalInRange: proof.pageTotal >= 950 && proof.pageTotal <= 1250,
          stressPagesConfigured: proof.stressPageCount >= 900,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        pageTotalInRange: true,
        stressPagesConfigured: true,
        virtualized: true,
      });

    const targetBlockPath = 1532;
    const targetTextPrefix = 'Release ';

    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await expect
      .poll(async () =>
        editor.root.locator(`[data-slate-path="${targetBlockPath}"]`).count()
      )
      .toBeGreaterThan(0);
    await editor.root
      .locator(`[data-slate-path="${targetBlockPath}"]`)
      .evaluate(async (block) => {
        block.scrollIntoView({ block: 'center' });
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      });
    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await expect
      .poll(async () =>
        editor.root.evaluate((element: HTMLElement, path) => {
          const text = element.querySelector(`[data-slate-path="${path},0"]`);

          return {
            domSync: text?.getAttribute('data-slate-dom-sync') ?? null,
            projectedDomSync:
              text?.getAttribute('data-slate-projected-dom-sync') ?? null,
            reason: text?.getAttribute('data-slate-dom-sync-reason') ?? null,
          };
        }, targetBlockPath)
      )
      .toEqual({
        domSync: null,
        projectedDomSync: 'true',
        reason: 'projection',
      });
    await editor.focus();
    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: {
          path: [targetBlockPath, 0],
          offset: targetTextPrefix.length,
        },
        focus: {
          path: [targetBlockPath, 0],
          offset: targetTextPrefix.length,
        },
      });
    const rafCadenceMs = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          requestAnimationFrame((first) => {
            requestAnimationFrame((second) => {
              resolve(second - first);
            });
          });
        })
    );

    await expect
      .poll(async () => {
        const sample = await getPaginationMiddleTypingSample(editor.root, {
          eventStart: 0,
          expectedText: 'Release readiness memo',
          path: targetBlockPath,
        });

        return {
          blockVisible: sample.blockVisible,
          boundedDOM: sample.totalElementCount < 1400,
          boundedPages: sample.pageSurfaceCount <= 10,
        };
      })
      .toEqual({
        blockVisible: true,
        boundedDOM: true,
        boundedPages: true,
      });

    let typedPrefix = '';

    typedPrefix += 'x';
    await armPaginationMiddleTypingProbe(editor.root, {
      expectedText: `${targetTextPrefix}${typedPrefix}readiness memo`,
      path: targetBlockPath,
    });
    await page.keyboard.type('x', { delay: 0 });
    const warmupSample = await readPaginationMiddleTypingProbe(editor.root);

    expect(warmupSample.blockVisible).toBe(true);
    expect(warmupSample.hasExpectedText).toBe(true);
    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: {
          path: [targetBlockPath, 0],
          offset: targetTextPrefix.length + typedPrefix.length,
        },
        focus: {
          path: [targetBlockPath, 0],
          offset: targetTextPrefix.length + typedPrefix.length,
        },
      });

    const samples: PaginationMiddleTypingSample[] = [];

    for (const char of [
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
      'g',
      'h',
      'i',
      'j',
      'k',
      'l',
      'm',
      'n',
      'o',
      'p',
    ]) {
      typedPrefix += char;
      const expectedText = `${targetTextPrefix}${typedPrefix}readiness memo`;

      await armPaginationMiddleTypingProbe(editor.root, {
        expectedText,
        path: targetBlockPath,
      });
      await page.keyboard.type(char, { delay: 0 });
      const sample = await readPaginationMiddleTypingProbe(editor.root);

      expect(sample.blockVisible).toBe(true);
      expect(sample.hasExpectedText).toBe(true);
      expect(sample.totalElementCount).toBeLessThan(1600);
      expect(sample.pageSurfaceCount).toBeLessThanOrEqual(10);
      await expect
        .poll(async () => editor.selection.get())
        .toEqual({
          anchor: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + typedPrefix.length,
          },
          focus: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + typedPrefix.length,
          },
        });
      samples.push(sample);
    }

    const finalExpectedText = `${targetTextPrefix}${typedPrefix}readiness memo`;

    await expect
      .poll(async () => ({
        modelHasText: (await editor.get.modelText()).includes(
          finalExpectedText
        ),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        modelHasText: true,
        selection: {
          anchor: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + typedPrefix.length,
          },
          focus: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + typedPrefix.length,
          },
        },
      });

    const p95EventToPaint = getPercentile(
      samples.map((sample) => sample.eventToPaintMs),
      0.95
    );
    const maxEventToPaint = Math.max(
      ...samples.map((sample) => sample.eventToPaintMs)
    );
    const p95TextObserved = getPercentile(
      samples
        .map((sample) => sample.textObservedMs)
        .filter((value): value is number => typeof value === 'number'),
      0.95
    );
    const p95ComposeMs = getPercentile(
      samples.map((sample) => sample.composeMs),
      0.95
    );

    await testInfo.attach('pagination-middle-typing-metrics', {
      body: JSON.stringify(
        {
          maxDOM: Math.max(
            ...samples.map((sample) => sample.totalElementCount)
          ),
          maxEventToPaint,
          maxPageSurfaces: Math.max(
            ...samples.map((sample) => sample.pageSurfaceCount)
          ),
          p95ComposeMs,
          p95EventToPaint,
          p95TextObserved,
          rafCadenceMs,
          samples,
        },
        null,
        2
      ),
      contentType: 'application/json',
    });

    expect(p95TextObserved).toBeLessThanOrEqual(16);
    expect(maxEventToPaint).toBeLessThanOrEqual(120);
  });

  test('keeps fast burst typing intact in a 1000-page virtualized document', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination middle-document burst typing'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'virtualized' },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          pageTotalInRange: proof.pageTotal >= 950 && proof.pageTotal <= 1250,
          stressPagesConfigured: proof.stressPageCount >= 900,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        pageTotalInRange: true,
        stressPagesConfigured: true,
        virtualized: true,
      });

    const targetBlockPath = 1532;
    const targetTextPrefix = 'Release ';
    const burstText = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const expectedText = `${targetTextPrefix}${burstText}readiness memo`;

    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await expect
      .poll(async () =>
        editor.root.locator(`[data-slate-path="${targetBlockPath}"]`).count()
      )
      .toBeGreaterThan(0);
    await editor.root
      .locator(`[data-slate-path="${targetBlockPath}"]`)
      .evaluate(async (block) => {
        block.scrollIntoView({ block: 'center' });
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      });
    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await editor.focus();
    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: {
          path: [targetBlockPath, 0],
          offset: targetTextPrefix.length,
        },
        focus: {
          path: [targetBlockPath, 0],
          offset: targetTextPrefix.length,
        },
      });

    const startedAt = await page.evaluate(() => performance.now());

    await armPaginationMiddleTypingProbe(editor.root, {
      expectedText,
      path: targetBlockPath,
    });

    await page.keyboard.type(burstText, { delay: 0 });
    const burstSample = await readPaginationMiddleTypingProbe(editor.root);

    await expect
      .poll(
        async () => {
          const sample = await getPaginationMiddleTypingSample(editor.root, {
            eventStart: startedAt,
            expectedText,
            path: targetBlockPath,
          });

          return {
            blockText: sample.blockText,
            blockVisible: sample.blockVisible,
            boundedDOM: sample.totalElementCount < 1400,
            boundedPages: sample.pageSurfaceCount <= 10,
            hasExpectedText: sample.hasExpectedText,
            modelHasExpectedText: (await editor.get.modelText()).includes(
              expectedText
            ),
            selection: await editor.selection.get(),
          };
        },
        { timeout: 5000 }
      )
      .toEqual({
        blockText: expect.stringContaining(expectedText),
        blockVisible: true,
        boundedDOM: true,
        boundedPages: true,
        hasExpectedText: true,
        modelHasExpectedText: true,
        selection: {
          anchor: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + burstText.length,
          },
          focus: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + burstText.length,
          },
        },
      });

    const settledMs = await page.evaluate(
      (eventStart) => performance.now() - eventStart,
      startedAt
    );
    const finalProof = await getPaginationVirtualizedTableProof(editor.root);
    const burstPostInputPaintMs =
      burstSample.lastInputToPaintMs ?? burstSample.eventToPaintMs;

    await testInfo.attach('pagination-fast-burst-metrics', {
      body: JSON.stringify(
        {
          burstLength: burstText.length,
          burstPostInputPaintMs,
          eventToPaintMs: burstSample.eventToPaintMs,
          inputEventCount: burstSample.inputEventCount,
          pageSurfaceCount: finalProof.pageSurfaceCount,
          pageTotal: finalProof.pageTotal,
          settledMs,
          textObservedMs: burstSample.textObservedMs,
          stressPageCount: finalProof.stressPageCount,
          totalElementCount: finalProof.totalElementCount,
        },
        null,
        2
      ),
      contentType: 'application/json',
    });

    expect(burstSample.inputEventCount).toBe(burstText.length);
    expect(burstPostInputPaintMs).toBeLessThanOrEqual(500);
    expect(burstSample.eventToPaintMs).toBeLessThanOrEqual(1500);
  });

  test('keeps staged burst typing responsive in the 15-page document', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for staged pagination burst typing latency'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'staged' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          pageTotalInRange: proof.pageTotal >= 12 && proof.pageTotal <= 18,
          staged:
            (await editor.root
              .locator('[data-slate-dom-strategy-virtualizer="true"]')
              .count()) === 0,
        };
      })
      .toEqual({
        pageTotalInRange: true,
        staged: true,
      });

    const targetBlockPath = 43;
    const targetTextPrefix = 'This ';
    const targetText = 'This mixed block carries ';
    const incrementalText = 'abcdefghijklmnop';
    const burstText = 'qrstuvwxyz12';

    await editor.dom.collapseAtTextPath(
      {
        path: [targetBlockPath, 0],
        offset: targetTextPrefix.length,
      },
      { align: 'center' }
    );
    await editor.assert.collapsedModelDOMSelection({
      offset: targetTextPrefix.length,
      path: [targetBlockPath, 0],
      text: targetText,
    });

    let typedPrefix = '';
    const samples: PaginationMiddleTypingSample[] = [];

    for (const char of incrementalText) {
      typedPrefix += char;
      const expectedText = `${targetTextPrefix}${typedPrefix}mixed block carries`;

      await armPaginationMiddleTypingProbe(editor.root, {
        expectedText,
        path: targetBlockPath,
      });
      await page.keyboard.type(char, { delay: 0 });
      const sample = await readPaginationMiddleTypingProbe(editor.root);

      expect(sample.blockVisible).toBe(true);
      expect(sample.hasExpectedText).toBe(true);
      samples.push(sample);
    }

    const finalText = `${targetTextPrefix}${incrementalText}${burstText}mixed block carries`;

    await armPaginationMiddleTypingProbe(editor.root, {
      expectedText: finalText,
      path: targetBlockPath,
    });
    await page.keyboard.type(burstText, { delay: 0 });
    const burstSample = await readPaginationMiddleTypingProbe(editor.root);

    expect(burstSample.blockVisible).toBe(true);
    expect(burstSample.hasExpectedText).toBe(true);

    await expect
      .poll(
        async () =>
          editor.root.evaluate(
            (
              element: HTMLElement,
              payload: {
                expectedText: string;
                path: number;
              }
            ) => {
              const block = element.ownerDocument.querySelector<HTMLElement>(
                `[data-slate-path="${payload.path}"]`
              );
              const handle = (element as Record<string, any>)
                .__slateBrowserHandle;

              return {
                hasExpectedText:
                  block?.textContent?.includes(payload.expectedText) ?? false,
                modelHasExpectedText:
                  handle?.getText?.().includes(payload.expectedText) ?? false,
                selection: handle?.getSelection?.() ?? null,
              };
            },
            {
              expectedText: finalText,
              path: targetBlockPath,
            }
          ),
        { intervals: [16], timeout: 5000 }
      )
      .toEqual({
        hasExpectedText: true,
        modelHasExpectedText: true,
        selection: {
          anchor: {
            path: [targetBlockPath, 0],
            offset:
              targetTextPrefix.length +
              incrementalText.length +
              burstText.length,
          },
          focus: {
            path: [targetBlockPath, 0],
            offset:
              targetTextPrefix.length +
              incrementalText.length +
              burstText.length,
          },
        },
      });

    const burstSettledMs = burstSample.eventToPaintMs;
    const p95EventToPaint = getPercentile(
      samples.map((sample) => sample.eventToPaintMs),
      0.95
    );
    const maxEventToPaint = Math.max(
      ...samples.map((sample) => sample.eventToPaintMs)
    );
    const p95ComposeMs = getPercentile(
      samples.map((sample) => sample.composeMs),
      0.95
    );

    await testInfo.attach('pagination-staged-burst-metrics', {
      body: JSON.stringify(
        {
          burstLength: burstText.length,
          burstSettledMs,
          burstSample,
          maxEventToPaint,
          p95ComposeMs,
          p95EventToPaint,
          samples,
        },
        null,
        2
      ),
      contentType: 'application/json',
    });
    expect(p95EventToPaint).toBeLessThanOrEqual(32);
    expect(maxEventToPaint).toBeLessThanOrEqual(50);
    expect(burstSettledMs).toBeLessThanOrEqual(250);
  });

  test('keeps staged typing responsive in a 500-row provider-owned table document', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for table-heavy staged pagination typing latency'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', rows: 500, strategy: 'staged' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1600,
          mountedRowsBounded: proof.mountedRowCount <= 80,
          pageTotalInRange: proof.pageTotal >= 20 && proof.pageTotal <= 40,
          staged:
            (await editor.root
              .locator('[data-slate-dom-strategy-virtualizer="true"]')
              .count()) === 0,
          tableRowsWindowed: proof.mountedRowCount < 500,
        };
      })
      .toEqual({
        boundedDOM: true,
        mountedRowsBounded: true,
        pageTotalInRange: true,
        staged: true,
        tableRowsWindowed: true,
      });

    const targetBlockPath = 43;
    const targetTextPrefix = 'This ';
    const targetText = 'This mixed block carries ';
    const incrementalText = 'abcdefghijklmnop';
    const burstText = 'qrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    await editor.dom.collapseAtTextPath(
      {
        path: [targetBlockPath, 0],
        offset: targetTextPrefix.length,
      },
      { align: 'center' }
    );
    await editor.assert.collapsedModelDOMSelection({
      offset: targetTextPrefix.length,
      path: [targetBlockPath, 0],
      text: targetText,
    });

    let typedPrefix = '';
    const samples: PaginationMiddleTypingSample[] = [];

    for (const char of incrementalText) {
      typedPrefix += char;
      const expectedText = `${targetTextPrefix}${typedPrefix}mixed block carries`;

      await armPaginationMiddleTypingProbe(editor.root, {
        expectedText,
        path: targetBlockPath,
      });
      await page.keyboard.type(char, { delay: 0 });
      const sample = await readPaginationMiddleTypingProbe(editor.root);

      expect(sample.blockVisible).toBe(true);
      expect(sample.hasExpectedText).toBe(true);
      expect(sample.totalElementCount).toBeLessThan(1600);
      samples.push(sample);
    }

    const finalText = `${targetTextPrefix}${incrementalText}${burstText}mixed block carries`;

    await armPaginationMiddleTypingProbe(editor.root, {
      expectedText: finalText,
      path: targetBlockPath,
    });
    await page.keyboard.type(burstText, { delay: 0 });
    const burstSample = await readPaginationMiddleTypingProbe(editor.root);

    expect(burstSample.blockVisible).toBe(true);
    expect(burstSample.hasExpectedText).toBe(true);

    await expect
      .poll(
        async () =>
          editor.root.evaluate(
            (
              element: HTMLElement,
              payload: {
                expectedText: string;
                path: number;
              }
            ) => {
              const block = element.ownerDocument.querySelector<HTMLElement>(
                `[data-slate-path="${payload.path}"]`
              );
              const handle = (element as Record<string, any>)
                .__slateBrowserHandle;

              return {
                hasExpectedText:
                  block?.textContent?.includes(payload.expectedText) ?? false,
                modelHasExpectedText:
                  handle?.getText?.().includes(payload.expectedText) ?? false,
                selection: handle?.getSelection?.() ?? null,
              };
            },
            {
              expectedText: finalText,
              path: targetBlockPath,
            }
          ),
        { intervals: [16], timeout: 5000 }
      )
      .toEqual({
        hasExpectedText: true,
        modelHasExpectedText: true,
        selection: {
          anchor: {
            path: [targetBlockPath, 0],
            offset:
              targetTextPrefix.length +
              incrementalText.length +
              burstText.length,
          },
          focus: {
            path: [targetBlockPath, 0],
            offset:
              targetTextPrefix.length +
              incrementalText.length +
              burstText.length,
          },
        },
      });

    const burstSettledMs = burstSample.eventToPaintMs;
    const p95EventToPaint = getPercentile(
      samples.map((sample) => sample.eventToPaintMs),
      0.95
    );
    const maxEventToPaint = Math.max(
      ...samples.map((sample) => sample.eventToPaintMs)
    );
    const p95ComposeMs = getPercentile(
      samples.map((sample) => sample.composeMs),
      0.95
    );
    const finalProof = await getPaginationVirtualizedTableProof(editor.root);

    await testInfo.attach('pagination-staged-500-row-burst-metrics', {
      body: JSON.stringify(
        {
          burstLength: burstText.length,
          burstSettledMs,
          burstSample,
          maxEventToPaint,
          mountedCellCount: finalProof.mountedCellCount,
          mountedRowCount: finalProof.mountedRowCount,
          p95ComposeMs,
          p95EventToPaint,
          samples,
          totalElementCount: finalProof.totalElementCount,
        },
        null,
        2
      ),
      contentType: 'application/json',
    });
    expect(finalProof.mountedRowCount).toBeLessThan(500);
    expect(finalProof.totalElementCount).toBeLessThan(1600);
    expect(p95EventToPaint).toBeLessThanOrEqual(32);
    expect(maxEventToPaint).toBeLessThanOrEqual(50);
    expect(burstSettledMs).toBeLessThanOrEqual(900);
  });

  test('keeps rows=800 virtualized pagination in the staged-class perf envelope', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for rows=800 virtualized pagination perf'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const elementBudget = 900;
    const wallLoadStartedAt = Date.now();
    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', rows: 800, strategy: 'virtualized' },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const wallLoadMs = Date.now() - wallLoadStartedAt;

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount <= elementBudget,
          boundedPages: proof.pageSurfaceCount <= 8,
          pageTotalInRange: proof.pageTotal >= 950 && proof.pageTotal <= 1250,
          stressPagesConfigured: proof.stressPageCount >= 900,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        pageTotalInRange: true,
        stressPagesConfigured: true,
        virtualized: true,
      });
    const appReadyAfterDOMContentLoadedMs = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as
        | PerformanceNavigationTiming
        | undefined;

      return navigation
        ? performance.now() - navigation.domContentLoadedEventEnd
        : performance.now();
    });

    const targetBlockPath = 43;
    const targetTextPrefix = 'This ';
    const incrementalText = 'abcdefghijklmnop';
    const burstText = 'qrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await expect
      .poll(async () =>
        editor.root.locator(`[data-slate-path="${targetBlockPath}"]`).count()
      )
      .toBeGreaterThan(0);
    await editor.root
      .locator(`[data-slate-path="${targetBlockPath}"]`)
      .evaluate(async (block) => {
        block.scrollIntoView({ block: 'center' });
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      });
    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await editor.focus();

    let typedPrefix = '';
    const samples: PaginationMiddleTypingSample[] = [];

    for (const char of incrementalText) {
      typedPrefix += char;
      const expectedText = `${targetTextPrefix}${typedPrefix}mixed block carries`;

      await armPaginationMiddleTypingProbe(editor.root, {
        expectedText,
        path: targetBlockPath,
      });
      await page.keyboard.type(char, { delay: 0 });
      const sample = await readPaginationMiddleTypingProbe(editor.root);

      expect(sample.blockVisible).toBe(true);
      expect(sample.hasExpectedText).toBe(true);
      expect(sample.totalElementCount).toBeLessThanOrEqual(elementBudget);
      expect(sample.pageSurfaceCount).toBeLessThanOrEqual(8);
      samples.push(sample);
    }

    const finalText = `${targetTextPrefix}${incrementalText}${burstText}mixed block carries`;

    await armPaginationMiddleTypingProbe(editor.root, {
      expectedText: finalText,
      path: targetBlockPath,
    });
    await page.keyboard.type(burstText, { delay: 0 });
    const burstSample = await readPaginationMiddleTypingProbe(editor.root);

    expect(burstSample.blockVisible).toBe(true);
    expect(burstSample.hasExpectedText).toBe(true);
    expect(burstSample.totalElementCount).toBeLessThanOrEqual(elementBudget);
    expect(burstSample.pageSurfaceCount).toBeLessThanOrEqual(8);

    const viewport = page.locator('[data-testid="pagination-viewport"]');
    const scrollStartedAt = await page.evaluate(() => performance.now());
    let scrollSample: PaginationFastScrollSample | null = null;

    await viewport.evaluate((element) => {
      const viewport = element as HTMLElement;

      viewport.scrollTop = viewport.scrollHeight * 0.55;
    });
    await expect
      .poll(
        async () => {
          const sample = await getPaginationFastScrollSample(
            editor.root,
            scrollStartedAt
          );
          const result = {
            boundedDOM: sample.totalElementCount <= elementBudget,
            boundedPages: sample.pageSurfaceCount <= 8,
            hasVisibleText: sample.visibleText.length > 0,
            hitVisibleContent: sample.hitVisibleContentCount > 0,
          };

          if (Object.values(result).every(Boolean)) {
            scrollSample = sample;
          }

          return result;
        },
        { intervals: [16], timeout: 5000 }
      )
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        hasVisibleText: true,
        hitVisibleContent: true,
      });

    const p95EventToPaint = getPercentile(
      samples.map((sample) => sample.eventToPaintMs),
      0.95
    );
    const maxEventToPaint = Math.max(
      ...samples.map((sample) => sample.eventToPaintMs)
    );
    const burstSettledMs = burstSample.eventToPaintMs;
    const burstPostInputPaintMs =
      burstSample.lastInputToPaintMs ?? burstSettledMs;
    const finalScrollSample =
      scrollSample ??
      (await getPaginationFastScrollSample(editor.root, scrollStartedAt));
    const scrollSettledMs = finalScrollSample.eventToPaintMs;
    const finalProof = await getPaginationVirtualizedTableProof(editor.root);

    await testInfo.attach('pagination-virtualized-rows800-perf-metrics', {
      body: JSON.stringify(
        {
          burstLength: burstText.length,
          burstPostInputPaintMs,
          burstSettledMs,
          appReadyAfterDOMContentLoadedMs,
          finalProof,
          maxEventToPaint,
          p95EventToPaint,
          samples,
          scrollSample: finalScrollSample,
          scrollSettledMs,
          wallLoadMs,
        },
        null,
        2
      ),
      contentType: 'application/json',
    });

    expect(appReadyAfterDOMContentLoadedMs).toBeLessThanOrEqual(2500);
    expect(p95EventToPaint).toBeLessThanOrEqual(32);
    expect(maxEventToPaint).toBeLessThanOrEqual(50);
    expect(burstSample.inputEventCount).toBe(burstText.length);
    expect(burstPostInputPaintMs).toBeLessThanOrEqual(80);
    expect(burstSettledMs).toBeLessThanOrEqual(2500);
    expect(scrollSettledMs).toBeLessThanOrEqual(400);
    expect(finalProof.totalElementCount).toBeLessThanOrEqual(elementBudget);
    expect(finalProof.pageSurfaceCount).toBeLessThanOrEqual(8);
  });

  test('keeps fast staged text after insert breaks at the model caret', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for staged pagination insert-break burst routing'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'staged' },
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          pageTotalInRange: proof.pageTotal >= 12 && proof.pageTotal <= 18,
          staged:
            (await editor.root
              .locator('[data-slate-dom-strategy-virtualizer="true"]')
              .count()) === 0,
        };
      })
      .toEqual({
        pageTotalInRange: true,
        staged: true,
      });

    const targetBlockPath = 43;
    const targetTextPrefix = 'This ';
    const originalSuffix =
      'mixed block carries strong, emphasis, inline code, and strikethrough text for run-aware layout.';

    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await editor.root
      .locator(`[data-slate-path="${targetBlockPath}"]`)
      .evaluate(async (block) => {
        block.scrollIntoView({ block: 'center' });
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      });
    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await editor.focus();

    await page.keyboard.type('abc\ndef\nghi\njkl\nmno', { delay: 0 });

    await expect
      .poll(async () =>
        editor.root.evaluate(
          (
            element: HTMLElement,
            payload: {
              endPath: number;
              startPath: number;
            }
          ) => {
            const handle = (element as Record<string, any>)
              .__slateBrowserHandle;
            const blockTexts = [];

            for (
              let path = payload.startPath;
              path <= payload.endPath;
              path++
            ) {
              blockTexts.push(
                element.querySelector<HTMLElement>(
                  `[data-slate-path="${path}"]`
                )?.textContent ?? ''
              );
            }

            return {
              blockTexts,
              selection: handle?.getSelection?.() ?? null,
            };
          },
          {
            endPath: targetBlockPath + 4,
            startPath: targetBlockPath,
          }
        )
      )
      .toEqual({
        blockTexts: [
          `${targetTextPrefix}abc`,
          'def',
          'ghi',
          'jkl',
          `mno${originalSuffix}`,
        ],
        selection: {
          anchor: { path: [targetBlockPath + 4, 0], offset: 3 },
          focus: { path: [targetBlockPath + 4, 0], offset: 3 },
        },
      });

    await testInfo.attach('pagination-insert-break-burst-proof', {
      body: JSON.stringify(
        {
          expectedBlocks: [
            `${targetTextPrefix}abc`,
            'def',
            'ghi',
            'jkl',
            `mno${originalSuffix}`,
          ],
          targetBlockPath,
        },
        null,
        2
      ),
      contentType: 'application/json',
    });
  });

  test('resets deferred virtualized text offset after moving the caret in the same block', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for virtualized deferred input offset reset'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await page.getByLabel('DOM strategy').selectOption('virtualized');

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        virtualized: true,
      });

    const targetBlockPath = 1532;
    const targetTextPrefix = 'Release ';

    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await editor.root
      .locator(`[data-slate-path="${targetBlockPath}"]`)
      .evaluate(async (block) => {
        block.scrollIntoView({ block: 'center' });
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );
      });
    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length,
    });
    await editor.focus();

    await page.keyboard.type('abc', { delay: 0 });
    await expect
      .poll(async () => ({
        modelHasExpectedText: (await editor.get.modelText()).includes(
          'Release abcreadiness memo'
        ),
        selection: await editor.selection.get(),
      }))
      .toEqual({
        modelHasExpectedText: true,
        selection: {
          anchor: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + 3,
          },
          focus: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + 3,
          },
        },
      });

    await editor.selection.collapse({
      path: [targetBlockPath, 0],
      offset: targetTextPrefix.length + 1,
    });
    await editor.focus();
    await page.keyboard.insertText('X');

    await expect
      .poll(async () => {
        const sample = await getPaginationMiddleTypingSample(editor.root, {
          eventStart: 0,
          expectedText: 'Release aXbcreadiness memo',
          path: targetBlockPath,
        });

        return {
          hasExpectedText: sample.hasExpectedText,
          modelHasExpectedText: (await editor.get.modelText()).includes(
            'Release aXbcreadiness memo'
          ),
          selection: await editor.selection.get(),
        };
      })
      .toEqual({
        hasExpectedText: true,
        modelHasExpectedText: true,
        selection: {
          anchor: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + 2,
          },
          focus: {
            path: [targetBlockPath, 0],
            offset: targetTextPrefix.length + 2,
          },
        },
      });
  });

  test('keeps visible content mounted during fast wheel scrolling through the virtualized table', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination fast-scroll replay'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await page.getByLabel('DOM strategy').selectOption('virtualized');

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 8,
          tablePagesInRange:
            proof.tablePageCount >= 8 && proof.tablePageCount <= 12,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        tablePagesInRange: true,
        virtualized: true,
      });

    const viewport = page.locator('[data-testid="pagination-viewport"]');

    await viewport.evaluate(async (element) => {
      const scrollRoot = element as HTMLElement;

      scrollRoot.scrollTop = 0;
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
    });

    await expect
      .poll(async () => {
        const sample = await getPaginationFastScrollSample(editor.root, 0);

        return {
          boundedPages: sample.pageSurfaceCount <= 8,
          hasTopContent: /Premirror/.test(sample.visibleText),
          noTableRowsMounted: sample.mountedRowCount === 0,
        };
      })
      .toEqual({
        boundedPages: true,
        hasTopContent: true,
        noTableRowsMounted: true,
      });

    const box = await viewport.boundingBox();

    expect(box).toBeTruthy();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    const samples: PaginationFastScrollSample[] = [];

    for (const deltaY of [900, 900, 900, 900, 900, 900, 900, 900, 900, 900]) {
      const startedAt = await page.evaluate(() => performance.now());
      let passingSample: PaginationFastScrollSample | null = null;

      await page.mouse.wheel(0, deltaY);

      await expect
        .poll(
          async () => {
            const sample = await getPaginationFastScrollSample(
              editor.root,
              startedAt
            );

            const result = {
              boundedCells: sample.mountedCellCount <= 240,
              boundedDOM: sample.totalElementCount < 1400,
              boundedPages: sample.pageSurfaceCount <= 10,
              boundedRows: sample.mountedRowCount <= 80,
              hitVisibleContent: sample.hitVisibleContentCount > 0,
              hasVisibleText: sample.visibleText.length > 0,
              visibleRowsWhenMounted:
                sample.mountedRowCount === 0 || sample.visibleRowCount > 0,
            };

            if (Object.values(result).every(Boolean)) {
              passingSample = sample;
            }

            return result;
          },
          { timeout: 5000 }
        )
        .toEqual({
          boundedCells: true,
          boundedDOM: true,
          boundedPages: true,
          boundedRows: true,
          hasVisibleText: true,
          hitVisibleContent: true,
          visibleRowsWhenMounted: true,
        });

      if (passingSample) {
        samples.push(passingSample);
      }
    }

    const rowSamples = samples.filter(
      (sample) => sample.visibleRowCount > 0 && sample.firstRowIndex !== null
    );
    const eventToPaintSamples = samples.map((sample) => sample.eventToPaintMs);
    const maxEventToPaint = Math.max(...eventToPaintSamples);
    const p50EventToPaint = getPercentile(eventToPaintSamples, 0.5);
    const p95EventToPaint = getPercentile(eventToPaintSamples, 0.95);
    const slowEventToPaintSamples = eventToPaintSamples.filter(
      (value) => value > 500
    );

    await testInfo.attach('pagination-fast-scroll-metrics', {
      body: JSON.stringify(
        {
          maxEventToPaint,
          p50EventToPaint,
          p95EventToPaint,
          slowEventToPaintSamples,
          samples,
        },
        null,
        2
      ),
      contentType: 'application/json',
    });

    expect(rowSamples.length).toBeGreaterThan(0);
    expect(p50EventToPaint).toBeLessThanOrEqual(80);
    expect(slowEventToPaintSamples.length).toBeLessThanOrEqual(2);
    expect(maxEventToPaint).toBeLessThanOrEqual(1500);
  });

  test('keeps visible content mounted after a large virtualized scroll jump with an active caret', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for pagination scrollbar-jump replay'
    );

    await page.setViewportSize({ height: 1135, width: 1037 });
    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'virtualized' },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });

    await editor.selection.collapse({
      path: [1, 0],
      offset: 7,
    });
    await editor.focus();

    const viewport = page.locator('[data-testid="pagination-viewport"]');
    const scrollStartedAt = await page.evaluate(() => performance.now());

    await viewport.evaluate(async (element) => {
      const viewport = element as HTMLElement;

      viewport.scrollTop = Math.round(
        (viewport.scrollHeight - viewport.clientHeight) * 0.5
      );
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    await expect
      .poll(
        async () => {
          const sample = await getPaginationFastScrollSample(
            editor.root,
            scrollStartedAt
          );

          return {
            boundedDOM: sample.totalElementCount < 1400,
            boundedPages: sample.pageSurfaceCount <= 10,
            hasVisibleText: sample.visibleText.length > 0,
            hitVisibleContent: sample.hitVisibleContentCount > 0,
          };
        },
        { intervals: [16], timeout: 5000 }
      )
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        hasVisibleText: true,
        hitVisibleContent: true,
      });
  });

  test('keeps visible content mounted across repeated virtualized scroll jumps', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for repeated virtualized scrollbar jumps'
    );

    await page.setViewportSize({ height: 1135, width: 1037 });
    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'virtualized' },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const viewport = page.locator('[data-testid="pagination-viewport"]');
    const samples: PaginationFastScrollSample[] = [];

    for (const ratio of [0, 0.05, 0.2, 0.5, 0.8, 0.97, 1, 0.5, 0]) {
      const scrollStartedAt = await page.evaluate(() => performance.now());

      await viewport.evaluate((element, scrollRatio) => {
        const scrollRoot = element as HTMLElement;

        scrollRoot.scrollTop = Math.round(
          (scrollRoot.scrollHeight - scrollRoot.clientHeight) * scrollRatio
        );
      }, ratio);
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(resolve))
      );

      const sample = await getPaginationFastScrollSample(
        editor.root,
        scrollStartedAt
      );

      samples.push(sample);

      expect(sample.totalElementCount).toBeLessThan(1400);
      expect(sample.pageSurfaceCount).toBeLessThanOrEqual(10);
      expect(sample.visibleText.length).toBeGreaterThan(0);
      expect(sample.hitVisibleContentCount).toBeGreaterThan(0);
    }

    await testInfo.attach('pagination-scroll-jump-samples', {
      body: JSON.stringify(samples, null, 2),
      contentType: 'application/json',
    });
  });

  test('keeps provider-owned table rows visible after fast virtualized wheel scrolling', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for provider-owned table row placement during fast virtualized scroll'
    );

    await page.setViewportSize({ height: 1204, width: 1055 });
    const editor = await openExample(page, 'slate/pagination', {
      query: { page_layout: 'single', strategy: 'virtualized' },
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          boundedDOM: proof.totalElementCount < 1400,
          boundedPages: proof.pageSurfaceCount <= 10,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        virtualized: true,
      });

    const viewport = page.locator('[data-testid="pagination-viewport"]');
    const box = await viewport.boundingBox();

    expect(box).toBeTruthy();

    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);

    const scrollStartedAt = await page.evaluate(() => performance.now());

    for (const deltaY of [2500, 2500, 2500]) {
      await page.mouse.wheel(0, deltaY);
    }

    await expect
      .poll(
        async () => {
          const sample = await getPaginationFastScrollSample(
            editor.root,
            scrollStartedAt
          );

          return {
            boundedDOM: sample.totalElementCount < 1400,
            boundedPages: sample.pageSurfaceCount <= 10,
            mountedRows: sample.mountedRowCount > 0,
            visibleRowText: /Row \d+/.test(sample.visibleRowText),
            visibleRows: sample.visibleRowCount > 0,
          };
        },
        { intervals: [16, 50, 100], timeout: 5000 }
      )
      .toEqual({
        boundedDOM: true,
        boundedPages: true,
        mountedRows: true,
        visibleRowText: true,
        visibleRows: true,
      });
  });

  test('keeps scaled virtualized page surfaces aligned with scroll position', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for transformed page virtualization coordinates'
    );

    await page.setViewportSize({ height: 900, width: 720 });
    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await page.getByLabel('DOM strategy').selectOption('virtualized');
    await expect
      .poll(async () => {
        const proof = await getPaginationVirtualizedTableProof(editor.root);

        return {
          enoughPages: proof.pageTotal > 80,
          virtualized: proof.pageVirtualizationEnabled,
        };
      })
      .toEqual({
        enoughPages: true,
        virtualized: true,
      });

    const targetPageIndex = 40;
    const scrollProof = await page
      .locator('[data-testid="pagination-viewport"]')
      .evaluate(async (element, pageIndex) => {
        const viewport = element as HTMLElement;
        const root = document.querySelector<HTMLElement>(
          '[data-slate-paged-editable]'
        );
        const pageSurfaces = Array.from(
          document.querySelectorAll<HTMLElement>('[data-slate-page-surface]')
        );
        const firstPage = pageSurfaces[0];

        if (!root || !firstPage) {
          throw new Error('Cannot inspect mounted pagination surfaces');
        }

        const scale = root.getBoundingClientRect().height / root.offsetHeight;
        const rowTops = [
          ...new Set(pageSurfaces.map((surface) => surface.offsetTop)),
        ].sort((left, right) => left - right);
        const pageStride = rowTops[1] - rowTops[0];
        const pagesPerRow = pageSurfaces.filter(
          (surface) => surface.offsetTop === firstPage.offsetTop
        ).length;

        if (
          !Number.isFinite(pageStride) ||
          pageStride <= 0 ||
          pagesPerRow < 1
        ) {
          throw new Error('Cannot resolve mounted pagination row stride');
        }

        viewport.scrollTop = Math.round(
          pageStride * Math.floor(pageIndex / pagesPerRow) * scale
        );
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        );

        return { pageStride, scale };
      }, targetPageIndex);

    expect(scrollProof.scale).toBeLessThan(1);

    await expect
      .poll(() => getMountedPaginationPageIndexes(editor.root), {
        timeout: 15_000,
      })
      .toContain(targetPageIndex);
  });

  test('keeps repeated leading breaks as separate editable paragraphs', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination editing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const firstBlockText = (await editor.get.blockTexts())[0]!;

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.focus();

    for (let index = 0; index < 8; index++) {
      await editor.insertBreak();
    }

    await expect
      .poll(async () => (await editor.get.blockTexts()).slice(0, 9))
      .toEqual([...new Array(8).fill(''), firstBlockText]);
    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: { path: [8, 0], offset: 0 },
        focus: { path: [8, 0], offset: 0 },
      });

    await page.getByRole('switch', { name: 'Debug' }).click();
    await editor.selection.collapse({ path: [8, 0], offset: 0 });
    await editor.focus();
    await expect
      .poll(async () => {
        const positions = await getCaretAndFrameLeft(editor.root);

        return (
          positions &&
          positions.caretLeft >= Math.floor(positions.frameLeft) - 2
        );
      })
      .toBe(true);

    await expect
      .poll(async () => {
        const leadingBoxes = await getLeadingElementBoxes(editor.root, 9);

        return (
          leadingBoxes.length === 9 &&
          leadingBoxes.slice(0, 8).every((box) => box.height > 8) &&
          leadingBoxes
            .slice(1, 8)
            .every((box, index) => box.top > leadingBoxes[index]!.top)
        );
      })
      .toBe(true);

    await editor.deleteBackward();

    await expect
      .poll(async () => (await editor.get.blockTexts()).slice(0, 8))
      .toEqual([...new Array(7).fill(''), firstBlockText]);
    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: { path: [7, 0], offset: 0 },
        focus: { path: [7, 0], offset: 0 },
      });
  });

  test('keeps leading breaks when native Backspace merges after a space block', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination editing'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });
    const firstBlockText = (await editor.get.modelBlockTexts())[0]!;

    await editor.selection.collapse({ path: [0, 0], offset: 0 });
    await editor.focus();

    for (let index = 0; index < 4; index++) {
      await page.keyboard.press('Enter');
    }

    await page.keyboard.insertText(' ');
    await page.keyboard.press('Enter');

    await expect
      .poll(async () => (await editor.get.modelBlockTexts()).slice(0, 6))
      .toEqual([...new Array(4).fill(''), ' ', firstBlockText]);
    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: { path: [5, 0], offset: 0 },
        focus: { path: [5, 0], offset: 0 },
      });
    await editor.selection.selectDOM({
      anchor: { path: [5, 0], offset: 0 },
      focus: { path: [5, 0], offset: 0 },
    });
    await expectCollapsedModelMatchesDOMSelection(editor);

    await editor.press('Backspace');

    await expect
      .poll(async () => (await editor.get.modelBlockTexts()).slice(0, 5))
      .toEqual([...new Array(4).fill(''), ` ${firstBlockText}`]);
    await expect
      .poll(async () => editor.selection.get())
      .toEqual({
        anchor: { path: [4, 0], offset: 1 },
        focus: { path: [4, 0], offset: 1 },
      });
  });

  test('does not seed blank spacer paragraphs in the pagination fixture', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination fixture data'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Premirror Milestone 1 test document/,
      },
    });

    await expect
      .poll(async () => {
        const texts = (await editor.get.blockTexts()).slice(0, 42);

        return {
          firstFixtureCount: texts.length,
          fourthFollowsThird: texts[3]?.startsWith('Fourth paragraph'),
          hasBlankFixtureParagraph: texts.some((text) => text.length === 0),
          thirdIsThird: texts[2]?.startsWith('Third paragraph'),
        };
      })
      .toEqual({
        firstFixtureCount: 42,
        fourthFollowsThird: true,
        hasBlankFixtureParagraph: false,
        thirdIsThird: true,
      });
  });

  test('renders mixed rich Markdown content inside the page frame', async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'Chromium-only proof for experimental pagination rendering'
    );

    const editor = await openExample(page, 'slate/pagination', {
      ready: {
        editor: 'visible',
        text: /Rich Markdown pagination proof/,
      },
    });

    await page.getByRole('switch', { name: 'Debug' }).click();

    const getStaticProof = () =>
      editor.root.evaluate(() => {
        const viewport = document.querySelector(
          '[data-testid="pagination-viewport"]'
        );
        const thematicBreak = document.querySelector(
          '[data-testid="pagination-rich-thematic-break"]'
        );
        const codeBlock = document.querySelector(
          '[data-testid="pagination-rich-code-block"]'
        );
        const mixedBlock = Array.from(
          document.querySelectorAll('[data-slate-node="element"]')
        ).find((element) =>
          element.textContent?.includes('This mixed block carries')
        );
        const mixedLeafRows = new Map<
          number,
          {
            left: number;
            right: number;
            stringRight: number;
            text: string | null;
          }[]
        >();
        const frames = Array.from(
          document.querySelectorAll('[data-testid="pagination-content-frame"]')
        ).map((frame) => frame.getBoundingClientRect());
        const isInsideFrame = (element: Element | null) => {
          if (!element) {
            return false;
          }

          const rect = element.getBoundingClientRect();

          return frames.some(
            (frame) =>
              rect.left >= frame.left - 1 &&
              rect.right <= frame.right + 1 &&
              rect.top >= frame.top - 1 &&
              rect.bottom <= frame.bottom + 1
          );
        };
        const mixedLeafRects = Array.from(
          mixedBlock?.querySelectorAll('[data-slate-leaf]') ?? []
        ).map((leaf) => {
          const rect = leaf.getBoundingClientRect();
          const string =
            leaf.querySelector('[data-slate-string]') ??
            leaf.firstElementChild ??
            leaf;
          const stringRect = string.getBoundingClientRect();

          return {
            left: rect.left,
            looseSpacing: rect.right - stringRect.right,
            right: rect.right,
            stringRight: stringRect.right,
            text: leaf.textContent,
            top: Math.round(rect.top),
            width: rect.width,
          };
        });

        mixedLeafRects.forEach((rect) => {
          const row = mixedLeafRows.get(rect.top) ?? [];

          row.push({
            left: rect.left,
            right: rect.right,
            stringRight: rect.stringRight,
            text: rect.text,
          });
          mixedLeafRows.set(rect.top, row);
        });

        const mixedInlineRows = [...mixedLeafRows.values()].map((row) =>
          row.slice().sort((a, b) => a.left - b.left || a.right - b.right)
        );
        const mixedInlineOverlaps = mixedInlineRows.flatMap((sorted) =>
          sorted.slice(1).filter((rect, index) => {
            const previous = sorted[index]!;

            return rect.left < previous.right - 3;
          })
        );
        const mixedInlineLooseSpacing = mixedInlineRows.flatMap((sorted) =>
          sorted
            .slice(0, -1)
            .filter((rect) => rect.right - rect.stringRight > 8)
        );

        return {
          frameCount: frames.length,
          hasRichText: document.body.textContent?.includes(
            'Rich Markdown pagination proof'
          ),
          codeBlockInsideFrame: isInsideFrame(codeBlock),
          mixedInlineLeafCount: mixedLeafRects.length,
          mixedInlineLooseSpacingCount: mixedInlineLooseSpacing.length,
          mixedInlineOverlapCount: mixedInlineOverlaps.length,
          noHorizontalScroll: viewport
            ? viewport.scrollWidth <= viewport.clientWidth + 1
            : false,
          thematicBreakInsideFrame: isInsideFrame(thematicBreak),
        };
      });

    await expect.poll(getStaticProof).toMatchObject({
      frameCount: expect.any(Number),
      hasRichText: true,
      codeBlockInsideFrame: true,
      mixedInlineLeafCount: expect.any(Number),
      mixedInlineLooseSpacingCount: 0,
      noHorizontalScroll: true,
      thematicBreakInsideFrame: true,
    });
    const staticProof = await getStaticProof();

    expect(staticProof.frameCount).toBeGreaterThan(1);
    expect(staticProof.mixedInlineLeafCount).toBeGreaterThan(1);

    const tablePathAttribute = await editor.root
      .locator('[data-testid="pagination-rich-table"]')
      .getAttribute('data-slate-path');

    expect(tablePathAttribute).toBeTruthy();

    const tablePath = Number(tablePathAttribute);

    await editor.selection.collapse({
      path: [tablePath, 28, 1, 0],
      offset: 'Path-aware cell 29'.length,
    });

    await expect
      .poll(async () => {
        const proof = await getPaginationTableProof(editor.root);

        return {
          cellsMatchRows: proof.mountedCellCount === proof.mountedRowCount * 3,
          hasMountedWindow:
            proof.mountedRowCount > 0 && proof.mountedRowCount < 240,
          rowsFramed: proof.rowFrameIndexes.every((index) => index >= 0),
          visibleRowsMatch: proof.visibleRowCount === proof.mountedRowCount,
        };
      })
      .toEqual({
        cellsMatchRows: true,
        hasMountedWindow: true,
        rowsFramed: true,
        visibleRowsMatch: true,
      });

    await editor.selection.collapse({
      path: [tablePath + 1, 0],
      offset: 0,
    });

    await expect
      .poll(() =>
        editor.root.evaluate(() => {
          const image = document.querySelector(
            '[data-testid="pagination-rich-image"]'
          );
          const frames = Array.from(
            document.querySelectorAll(
              '[data-testid="pagination-content-frame"]'
            )
          ).map((frame) => frame.getBoundingClientRect());

          if (!image) {
            return false;
          }

          const rect = image.getBoundingClientRect();

          return frames.some(
            (frame) =>
              rect.left >= frame.left - 1 &&
              rect.right <= frame.right + 1 &&
              rect.top >= frame.top - 1 &&
              rect.bottom <= frame.bottom + 1
          );
        })
      )
      .toBe(true);
  });
});
