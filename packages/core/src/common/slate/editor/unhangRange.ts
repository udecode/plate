import { Editor, Path, Point, Range, Span } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';

export type UnhangRangeOptions = Parameters<typeof Editor.unhangRange>[2] & {
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
    Editor.unhangRange(editor as any, range, { voids });
  }
};
