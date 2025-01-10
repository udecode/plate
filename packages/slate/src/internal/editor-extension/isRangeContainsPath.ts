import { type Path, Range } from 'slate';

import type { Editor } from '../../interfaces';

export const isRangeContainsPath = (
  editor: Editor,
  path: Path,
  {
    at = editor.selection,
  }: {
    at?: Range | null;
  } = {}
): boolean => {
  if (!at) return false;

  const blockStart = editor.api.start(path)!;
  const blockEnd = editor.api.end(path)!;

  return Range.includes(at, blockStart) && Range.includes(at, blockEnd);
};
