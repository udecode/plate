import { PathApi, type SlateEditor } from 'platejs';

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
  editor: SlateEditor,
  point = editor.selection?.anchor
): TableMoveSelectionContext | undefined => {
  if (
    !point ||
    !editor.api.isAt({ block: true, match: { type: getCellTypes(editor) } })
  ) {
    return;
  }

  const cellEntry = editor.api.block({
    at: point,
    match: { type: getCellTypes(editor) },
  });
  const blockEntry = editor.api.block({ at: point });

  if (!cellEntry || !blockEntry) return;

  const [, cellPath] = cellEntry;
  const [, blockPath] = blockEntry;

  return { blockPath, cellPath, point };
};

export const hasAdjacentBlockInCell = (
  editor: SlateEditor,
  {
    blockPath,
    cellPath,
    reverse,
  }: Pick<TableMoveSelectionContext, 'blockPath' | 'cellPath'> & {
    reverse: boolean;
  }
) => {
  const adjacentBlock = reverse
    ? editor.api.previous({ at: blockPath, block: true })
    : editor.api.next({ at: blockPath, block: true });

  return !!adjacentBlock && PathApi.isAncestor(cellPath, adjacentBlock[1]);
};

export const shouldMoveSelectionFromCell = (
  editor: SlateEditor,
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
  const blockRange = editor.api.range(blockPath);
  const isAtBlockEdge = reverse
    ? editor.api.isStart(point, blockPath)
    : editor.api.isEnd(point, blockPath);

  if (!blockRange) return isAtBlockEdge;

  const caretRects = getRangeClientRects(
    editor.api.toDOMRange({ anchor: point, focus: point })
  );
  const blockRects = getRangeClientRects(editor.api.toDOMRange(blockRange));

  if (caretRects.length === 0 || blockRects.length === 0) return isAtBlockEdge;

  const caretRect = caretRects.at(-1)!;
  const boundary = reverse
    ? Math.min(...blockRects.map((rect) => rect.top))
    : Math.max(...blockRects.map((rect) => rect.bottom));

  return reverse
    ? caretRect.top <= boundary + VISUAL_LINE_TOLERANCE
    : caretRect.bottom >= boundary - VISUAL_LINE_TOLERANCE;
};
