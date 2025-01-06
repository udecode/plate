import type { TRange } from '@udecode/plate';

import { RangeApi } from '@udecode/plate';

import type { CaretPosition, SelectionRect } from '../types';

/** Get the caret position of a range from selectionRects. */
export const getCaretPosition = (
  selectionRects: SelectionRect[],
  range: TRange
): CaretPosition | null => {
  const isCollapsed = range && RangeApi.isCollapsed(range);
  const isBackward = range && RangeApi.isBackward(range);
  const anchorRect = selectionRects[isBackward ? 0 : selectionRects.length - 1];

  if (!anchorRect) {
    return null;
  }

  return {
    height: anchorRect.height,
    left: anchorRect.left + (isBackward || isCollapsed ? 0 : anchorRect.width),
    top: anchorRect.top,
  };
};
