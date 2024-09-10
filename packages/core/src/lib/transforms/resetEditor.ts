import type { SlateEditor } from '../editor';

import { resetEditorChildren } from './resetEditorChildren';

export const resetEditor = (editor: SlateEditor) => {
  resetEditorChildren(editor);

  editor.history.undos = [];
  editor.history.redos = [];
  editor.operations = [];
};
