import type { UnknownObject } from '@udecode/plate-common';

import type { CursorOverlayState, CursorState, SelectionRect } from '../types';

import { FROZEN_EMPTY_ARRAY } from '../hooks';
import { getCaretPosition } from './getCaretPosition';

/** Get cursor overlay state from selection rects. */
export const getCursorOverlayState = <
  TCursorData extends UnknownObject = UnknownObject,
>({
  cursors: cursorStates,
  selectionRects,
}: {
  cursors: Record<string, CursorState<TCursorData>>;
  selectionRects: Record<string, SelectionRect[]>;
}): CursorOverlayState<TCursorData>[] => {
  if (!cursorStates) return [];

  return Object.entries(cursorStates).map(([key, cursorState]) => {
    const selection = cursorState?.selection ?? null;
    const rects = selectionRects[key] ?? FROZEN_EMPTY_ARRAY;

    const caretPosition = selection ? getCaretPosition(rects, selection) : null;

    return {
      ...cursorState,
      caretPosition,
      selection,
      selectionRects: rects,
    };
  });
};
