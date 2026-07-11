import type { UnknownObject } from '@udecode/utils';

import type { CursorOverlayProps } from '../components';
import type { CursorOverlayState, SelectionRect } from '../types';

import { FROZEN_EMPTY_ARRAY } from '../types';
import { getCaretPosition } from './getCaretPosition';

/** Get cursor overlay state from selection rects. */
export const getCursorOverlayState = <
  TCursorData extends UnknownObject = UnknownObject,
>({
  cursors: cursorStates,
  selectionRects,
}: {
  selectionRects: Record<string, readonly SelectionRect[]>;
} & Pick<
  CursorOverlayProps<TCursorData>,
  'cursors'
>): CursorOverlayState<TCursorData>[] => {
  if (!cursorStates) return [];

  return Object.entries(cursorStates).map(([key, cursorState]) => {
    const selection = cursorState?.selection ?? null;
    const rects = selectionRects[key] ?? FROZEN_EMPTY_ARRAY;

    const caretPosition = selection ? getCaretPosition(rects, selection) : null;

    return {
      ...cursorState,
      caretPosition,
      id: key,
      selection,
      selectionRects: rects,
    };
  });
};
