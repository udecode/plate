import { unhangRange as unhangRangeBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor-type';

import {
  type EditorUnhangRangeOptions,
  type TRange,
  PathApi,
  RangeApi,
} from '../../interfaces/index';

export const unhangRange = (
  editor: Editor,
  range: TRange,
  options: EditorUnhangRangeOptions = {}
): TRange => {
  const { character, unhang = true, voids } = options;

  if (!RangeApi.isRange(range)) return range;
  if (character) {
    let [start, end] = RangeApi.edges(range);

    if (!PathApi.equals(start.path, end.path)) {
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
  }
  if (unhang) {
    return unhangRangeBase(editor as any, range, { voids }) as TRange;
  }

  return range;
};
