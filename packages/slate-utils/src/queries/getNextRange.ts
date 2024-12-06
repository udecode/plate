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
  // Handle the case when there's no 'from' range
  if (!from) {
    if (!editor.selection) {
      return reverse ? ranges.at(-1) : ranges[0];
    }

    const selectionPoint = Range.start(editor.selection);

    // Find the closest range
    let nextRange: Range | undefined;

    // eslint-disable-next-line unicorn/prefer-ternary
    if (reverse) {
      // When going backwards, find the last range that ends before the selection
      nextRange = [...ranges].reverse().find((range) => {
        const rangeEnd = Range.end(range);

        return (
          Point.isBefore(rangeEnd, selectionPoint) ||
          (Point.equals(rangeEnd, selectionPoint) &&
            Point.isBefore(Range.start(range), selectionPoint))
        );
      });
    } else {
      // When going forwards, find the first range that starts after the selection
      nextRange = ranges.find((range) =>
        Point.isAfter(Range.start(range), selectionPoint)
      );
    }

    return nextRange ?? (reverse ? ranges.at(-1) : ranges[0]);
  }

  // When there is a 'from' range, find the next/previous range
  const currentIndex = ranges.findIndex((range) => Range.equals(range, from));

  if (currentIndex === -1) return ranges[0]; // Return first range if current not found

  // Calculate next index
  let nextIndex: number;

  if (reverse) {
    nextIndex = currentIndex - 1 < 0 ? ranges.length - 1 : currentIndex - 1;
  } else {
    nextIndex = currentIndex + 1 >= ranges.length ? 0 : currentIndex + 1;
  }

  return ranges[nextIndex];
};
