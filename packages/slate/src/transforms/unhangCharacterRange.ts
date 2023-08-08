import { Path, Range } from 'slate';

import { getPointAfter, getPointBefore, TEditor, Value } from '../interfaces';

/**
 * Unhang the range of length 1 so both edges are in the same text node.
 */
export const unhangCharacterRange = <V extends Value>(
  editor: TEditor<V>,
  at: Range
) => {
  let [start, end] = Range.edges(at);

  if (!Path.equals(start.path, end.path)) {
    if (end.offset === 0) {
      const pointAfter = getPointAfter(editor, start);
      if (pointAfter) {
        end = pointAfter;
      }
    } else {
      const pointBefore = getPointBefore(editor, end);
      if (pointBefore) {
        start = pointBefore;
      }
    }
  }

  return { anchor: start, focus: end };
};
