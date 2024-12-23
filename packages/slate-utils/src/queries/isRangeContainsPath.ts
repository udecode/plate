import { type TEditor, getEndPoint, getStartPoint } from '@udecode/slate';
import { type Path, Range } from 'slate';

export const isRangeContainsPath = (
  editor: TEditor,
  path: Path,
  {
    at = editor.selection,
  }: {
    at?: Range | null;
  } = {}
): boolean => {
  if (!at) return false;

  const blockStart = getStartPoint(editor, path);
  const blockEnd = getEndPoint(editor, path);

  return Range.includes(at, blockStart) && Range.includes(at, blockEnd);
};
