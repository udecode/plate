import type { Path, Range } from 'slate';

import {
  type SlateEditor,
  getNextNodeStartPoint,
  getPreviousNodeEndPoint,
  setSelection,
} from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';

export const setSelectionInlineEquation = (
  editor: SlateEditor,
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
