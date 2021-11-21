import { Editor, Path, Point, Range, Span } from 'slate';
import { TEditor } from '../../types/slate/TEditor';

export interface UnhangRangeOptions {
  at?: Range | Path | Point | Span;
  voids?: boolean;
  unhang?: boolean;
}

/**
 * Return {@link Editor.unhangRange} if `unhang` is true and if `at` (default: selection) is a range.
 */
export const unhangRange = (
  editor: TEditor,
  options: UnhangRangeOptions = {}
) => {
  const { at = editor.selection, voids, unhang = true } = options;

  if (Range.isRange(at) && unhang) {
    options.at = Editor.unhangRange(editor, at, { voids });
  }
};
