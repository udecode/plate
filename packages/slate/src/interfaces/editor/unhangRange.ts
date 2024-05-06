import {
  Editor,
  type EditorUnhangRangeOptions,
  type Path,
  type Point,
  Range,
  type Span,
} from 'slate';

import type { TEditor, Value } from './TEditor';

export type UnhangRangeOptions = {
  unhang?: boolean;
} & EditorUnhangRangeOptions;

/**
 * Convert a range into a non-hanging one if:
 *
 * - `unhang` is true,
 * - `at` (default: selection) is a range.
 */
export const unhangRange = <
  V extends Value,
  R extends Path | Point | Range | Span | null | undefined,
>(
  editor: TEditor<V>,
  range: R,
  options: UnhangRangeOptions = {}
): R => {
  const { unhang = true, voids } = options;

  if (Range.isRange(range) && unhang) {
    return Editor.unhangRange(editor as any, range, { voids }) as R;
  }

  return range;
};
