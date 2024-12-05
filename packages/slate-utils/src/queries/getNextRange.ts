import type { TEditor } from '@udecode/slate';

import { Point, Range } from 'slate';

/**
 * Get the next range from a list of ranges.
 *
 * - Find the next range after/before the `from` range
 * - If no `from` range and no selection, select first/last depending on direction
 * - If no `from` range and selection, find the next range after/before the
 *   selection
 */
export const getNextRange = (
  editor: TEditor,
  {
    from,
    ranges,
    reverse,
  }: {
    ranges: Range[];
    from?: Range | null;
    reverse?: boolean;
  }
) => {
  if (ranges.length === 0) return;
  if (!from) {
    if (!editor.selection) {
      // If no selection and no range, select first/last depending on direction
      return reverse ? ranges.at(-1) : ranges[0];
    }

    // Find the first range after the current selection
    const selectionEnd = Range.end(editor.selection);
    const nextRange = ranges.find((range) => {
      const rangeStart = Range.start(range);

      return reverse
        ? Point.isBefore(rangeStart, selectionEnd)
        : Point.isAfter(rangeStart, selectionEnd);
    });

    // If no range found after selection, wrap around to first/last
    return nextRange ?? (reverse ? ranges.at(-1) : ranges[0]);
  }

  // Find current index
  const currentIndex = ranges.findIndex((range) => Range.equals(range, from));

  if (currentIndex === -1) return;

  // Calculate next index
  let nextIndex: number;

  if (reverse) {
    nextIndex = currentIndex - 1 < 0 ? ranges.length - 1 : currentIndex - 1;
  } else {
    nextIndex = currentIndex + 1 >= ranges.length ? 0 : currentIndex + 1;
  }

  return ranges[nextIndex];
};
