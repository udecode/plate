import { UnknownObject } from '@udecode/plate-common';
import { CursorOverlayProps } from '../components/index';
import { FROZEN_EMPTY_ARRAY } from '../hooks/index';
import { CursorOverlayState, SelectionRect } from '../types';
import { getCaretPosition } from './getCaretPosition';

/**
 * Get cursor overlay state from selection rects.
 */
export const getCursorOverlayState = <
  TCursorData extends UnknownObject = UnknownObject
>({
  cursors: cursorStates,
  selectionRects,
}: Pick<CursorOverlayProps<TCursorData>, 'cursors'> & {
  selectionRects: Record<string, SelectionRect[]>;
}): CursorOverlayState<TCursorData>[] => {
  if (!cursorStates) return [];

  return Object.entries(cursorStates).map(([key, cursorState]) => {
    const selection = cursorState?.selection ?? null;
    const rects = selectionRects[key] ?? FROZEN_EMPTY_ARRAY;

    const caretPosition = selection ? getCaretPosition(rects, selection) : null;

    return {
      ...cursorState,
      selection,
      caretPosition,
      selectionRects: rects,
    };
  });
};
