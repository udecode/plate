import { Value } from '@udecode/slate';
import { focusEditorEdge, isEditorFocused } from '@udecode/slate-react';

import { PlateEditor } from '../types/index';
import { resetEditorChildren } from './resetEditorChildren';

export const resetEditor = <V extends Value>(editor: PlateEditor<V>) => {
  const isFocused = isEditorFocused(editor);

  resetEditorChildren(editor);

  editor.history.undos = [];
  editor.history.redos = [];
  editor.operations = [];

  if (isFocused) {
    focusEditorEdge(editor, { edge: 'start' });
  }
};
