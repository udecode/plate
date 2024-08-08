import type { PlateEditor } from '../types/index';

import { resetEditorChildren } from './resetEditorChildren';

export const resetEditor = (editor: PlateEditor) => {
  resetEditorChildren(editor);

  editor.history.undos = [];
  editor.history.redos = [];
  editor.operations = [];
};
