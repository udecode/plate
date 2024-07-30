import type { Path, Range } from 'slate';

import {
  type PlateEditor,
  focusEditor,
  getNextNodeStartPoint,
  getPreviousNodeEndPoint,
  setSelection,
} from '@udecode/plate-common';

export const setSelectionInlineEquation = (
  editor: PlateEditor,
  at: Path,
  direction: 'left' | 'right'
) => {
  const point =
    direction === 'left'
      ? getPreviousNodeEndPoint(editor, at)
      : getNextNodeStartPoint(editor, at);

  if (!point) return;

  const range: Range = {
    anchor: point,
    focus: point,
  };

  setSelection(editor, range);
  focusEditor(editor);
};
