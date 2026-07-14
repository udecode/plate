import { PathApi } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';

import { getCellTypes } from '../utils/getCellType';

const VISUAL_LINE_TOLERANCE = 1;

export type TableMoveSelectionContext = {
  blockPath: number[];
  cellPath: number[];
  point: { offset: number; path: number[] };
};

const getRangeClientRects = (domRange?: Pick<Range, 'getClientRects'> | null) =>
  Array.from(domRange?.getClientRects?.() ?? []).filter(
    (rect) => rect.height > 0
  );

export const getTableMoveSelectionContext = (
  editor: BaseEditor,
  point = editor.read.selection()?.anchor
): TableMoveSelectionContext | undefined => {
  if (!point) return;

  const cellEntry = editor.read.nodes.above({
    at: point,
    match: { type: getCellTypes(editor) },
  });
  const blockEntry = editor.read.nodes.block({ at: point });

  if (!cellEntry || !blockEntry) return;

  const [, cellPath] = cellEntry;
  const [, blockPath] = blockEntry;

  return { blockPath, cellPath, point };
};

export const hasAdjacentBlockInCell = (
  editor: BaseEditor,
  {
    blockPath,
    cellPath,
    reverse,
  }: Pick<TableMoveSelectionContext, 'blockPath' | 'cellPath'> & {
    reverse: boolean;
  }
) => {
  const adjacentBlock = reverse
    ? editor.read.nodes.previous({
        at: blockPath,
        match: (node) => editor.read.nodes.isBlock(node),
      })
    : editor.read.nodes.next({
        at: blockPath,
        match: (node) => editor.read.nodes.isBlock(node),
      });

  return !!adjacentBlock && PathApi.isAncestor(cellPath, adjacentBlock[1]);
};

export const shouldMoveSelectionFromCell = (
  editor: BaseEditor,
  {
    blockPath,
    point,
    reverse,
  }: {
    blockPath: number[];
    point: { offset: number; path: number[] };
    reverse: boolean;
  }
) => {
  const blockRange = editor.read.ranges.get(blockPath);
  const isAtBlockEdge = reverse
    ? editor.read.points.isStart(point, blockPath)
    : editor.read.points.isEnd(point, blockPath);

  if (!blockRange) return isAtBlockEdge;

  const caretRects = getRangeClientRects(
    editor.api.dom.resolveDOMRange({ anchor: point, focus: point })
  );
  const blockRects = getRangeClientRects(
    editor.api.dom.resolveDOMRange(blockRange)
  );

  if (caretRects.length === 0 || blockRects.length === 0) return isAtBlockEdge;

  const caretRect = caretRects.at(-1)!;
  const boundary = reverse
    ? Math.min(...blockRects.map((rect) => rect.top))
    : Math.max(...blockRects.map((rect) => rect.bottom));

  return reverse
    ? caretRect.top <= boundary + VISUAL_LINE_TOLERANCE
    : caretRect.bottom >= boundary - VISUAL_LINE_TOLERANCE;
};
