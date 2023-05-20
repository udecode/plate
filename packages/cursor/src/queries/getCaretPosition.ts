import { Range } from 'slate';
import { CaretPosition, SelectionRect } from '../types';

/**
 * Get the caret position of a range from selectionRects.
 */
export const getCaretPosition = (
  selectionRects: SelectionRect[],
  range: Range
): CaretPosition | null => {
  const isCollapsed = range && Range.isCollapsed(range);
  const isBackward = range && Range.isBackward(range);
  const anchorRect = selectionRects[isBackward ? 0 : selectionRects.length - 1];

  if (!anchorRect) {
    return null;
  }

  return {
    height: anchorRect.height,
    top: anchorRect.top,
    left: anchorRect.left + (isBackward || isCollapsed ? 0 : anchorRect.width),
  };
};
