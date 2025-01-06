import { unhangRange as unhangRangeBase } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { Point } from '../../interfaces/point';

import {
  type EditorUnhangRangeOptions,
  type Path,
  type Span,
  type TRange,
  RangeApi,
} from '../../interfaces/index';

export const unhangRange = <
  E extends Editor,
  R extends Path | Point | Span | TRange | null | undefined,
>(
  editor: E,
  range: R,
  options: EditorUnhangRangeOptions = {}
): R => {
  const { unhang = true, voids } = options;

  if (RangeApi.isRange(range) && unhang) {
    return unhangRangeBase(editor as any, range, { voids }) as R;
  }

  return range;
};
