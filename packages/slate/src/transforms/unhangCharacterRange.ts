import { Path, Range } from 'slate';

import type { Editor } from '../interfaces';

/** Unhang the range of length 1 so both edges are in the same text node. */
export const unhangCharacterRange = (editor: Editor, at: Range) => {
  let [start, end] = Range.edges(at);

  if (!Path.equals(start.path, end.path)) {
    if (end.offset === 0) {
      const pointAfter = editor.api.after(start);

      if (pointAfter) {
        end = pointAfter;
      }
    } else {
      const pointBefore = editor.api.before(end);

      if (pointBefore) {
        start = pointBefore;
      }
    }
  }

  return { anchor: start, focus: end };
};
