import {
  Editor,
  EditorUnhangRangeOptions,
  Path,
  Point,
  Range,
  Span,
} from 'slate';
import { TRange } from '../../types/interfaces';
import { TEditor, Value } from './TEditor';

export type UnhangRangeOptions = EditorUnhangRangeOptions & {
  unhang?: boolean;
};

/**
 * Convert a range into a non-hanging one if:
 * - `unhang` is true,
 * - `at` (default: selection) is a range.
 */
export const unhangRange = <V extends Value>(
  editor: TEditor<V>,
  range?: Range | Path | Point | Span | null,
  options: UnhangRangeOptions = {}
) => {
  const { voids, unhang = true } = options;

  if (Range.isRange(range) && unhang) {
    return Editor.unhangRange(editor as any, range, { voids }) as TRange;
  }
};
