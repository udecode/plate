import {
  type EditorUnhangRangeOptions,
  type Path,
  type Point,
  type Span,
  Editor,
  Range,
} from 'slate';

import type { TEditor } from './TEditor';

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
  E extends TEditor,
  R extends Path | Point | Range | Span | null | undefined,
>(
  editor: E,
  range: R,
  options: UnhangRangeOptions = {}
): R => {
  const { unhang = true, voids } = options;

  if (Range.isRange(range) && unhang) {
    return Editor.unhangRange(editor as any, range, { voids }) as R;
  }

  return range;
};
