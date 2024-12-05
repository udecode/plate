import type { TEditor } from '@udecode/slate';

import { Point, Range } from 'slate';

/**
 * Check if the selection is in the range.
 *
 * - `contain`: Check if the selection is strictly inside the range
 * - `intersect`: Check if the selection intersects the range
 */
export const isSelectionInRange = (
  editor: TEditor,
  {
    at,
    mode = 'contain',
  }: {
    at: Range;
    mode?: 'contain' | 'intersect';
  }
) => {
  const selection = editor.selection;

  if (!selection) return false;
  if (mode === 'contain') {
    // Check if the selection is strictly inside the range
    return (
      (Point.isAfter(selection.anchor, Range.start(at)) ||
        Point.equals(selection.anchor, Range.start(at))) &&
      (Point.isBefore(selection.focus, Range.end(at)) ||
        Point.equals(selection.focus, Range.end(at)))
    );
  }

  return Range.includes(at, selection);
};
