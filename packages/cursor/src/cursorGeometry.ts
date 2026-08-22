import type { PlateEditor } from '@platejs/core/react';
import { type Range, PathApi, RangeApi, TextApi } from '@platejs/plite';
import type { UnknownObject } from '@udecode/utils';

import type {
  CaretPosition,
  CursorOverlayState,
  CursorState,
  SelectionRect,
} from './types';

export const FROZEN_EMPTY_ARRAY: readonly SelectionRect[] = Object.freeze([]);

/** Get the caret position of a range from selection rects. */
export const getCaretPosition = (
  selectionRects: readonly SelectionRect[],
  range: Range
): CaretPosition | null => {
  const isCollapsed = RangeApi.isCollapsed(range);
  const isBackward = RangeApi.isBackward(range);
  const anchorRect = selectionRects[isBackward ? 0 : selectionRects.length - 1];

  if (!anchorRect) return null;

  return {
    height: anchorRect.height,
    left: anchorRect.left + (isBackward || isCollapsed ? 0 : anchorRect.width),
    top: anchorRect.top,
  };
};

/** Get cursor overlay state from selection rects. */
export const getCursorOverlayState = <
  TCursorData extends UnknownObject = UnknownObject,
>({
  cursors,
  selectionRects,
}: {
  cursors?: Record<string, CursorState<TCursorData>>;
  selectionRects: Record<string, readonly SelectionRect[]>;
}): Array<CursorOverlayState<TCursorData>> => {
  if (!cursors) return [];

  return Object.entries(cursors).map(([id, cursor]) => {
    const selection = cursor.selection ?? null;
    const rects = selectionRects[id] ?? FROZEN_EMPTY_ARRAY;

    return {
      ...cursor,
      caretPosition: selection ? getCaretPosition(rects, selection) : null,
      id,
      selection,
      selectionRects: rects,
    };
  });
};

export const getSelectionRects = (
  editor: PlateEditor,
  {
    range,
    xOffset,
    yOffset,
  }: {
    range: Range;
    xOffset: number;
    yOffset: number;
  }
): SelectionRect[] => {
  const [start, end] = RangeApi.edges(range);
  const domRange = editor.api.dom.resolveDOMRange(range);

  if (!domRange) return [];

  const selectionRects: SelectionRect[] = [];
  const textEntries = editor.read.nodes.toArray({
    at: range,
    match: TextApi.isText,
  });

  for (const [textNode, textPath] of textEntries) {
    const domNode = editor.api.dom.resolveDOMNode(textNode);

    if (!domNode?.parentElement) return [];

    const isStartNode = PathApi.equals(textPath, start.path);
    const isEndNode = PathApi.equals(textPath, end.path);
    let clientRects: DOMRectList;

    if (isStartNode || isEndNode) {
      const nodeRange = document.createRange();

      nodeRange.selectNode(domNode);

      if (isStartNode) {
        nodeRange.setStart(domRange.startContainer, domRange.startOffset);
      }
      if (isEndNode) {
        nodeRange.setEnd(domRange.endContainer, domRange.endOffset);
      }

      clientRects = nodeRange.getClientRects();
    } else {
      clientRects = domNode.getClientRects();
    }

    for (const clientRect of clientRects) {
      selectionRects.push({
        height: clientRect.height,
        left: clientRect.left - xOffset,
        top: clientRect.top - yOffset,
        width: clientRect.width,
      });
    }
  }

  return selectionRects;
};
