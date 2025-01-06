import {
  type Path,
  type Point,
  type Span,
  Range,
  unhangRange as unhangRangeBase,
} from 'slate';

import type { Editor } from '../../interfaces/editor/editor';
import type { UnhangRangeOptions } from '../../interfaces/editor/editor-types';

export const unhangRange = <
  E extends Editor,
  R extends Path | Point | Range | Span | null | undefined,
>(
  editor: E,
  range: R,
  options: UnhangRangeOptions = {}
): R => {
  const { unhang = true, voids } = options;

  if (Range.isRange(range) && unhang) {
    return unhangRangeBase(editor as any, range, { voids }) as R;
  }

  return range;
};
