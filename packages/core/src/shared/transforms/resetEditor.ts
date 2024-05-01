import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../types/index';

import { resetEditorChildren } from './resetEditorChildren';

export const resetEditor = <V extends Value>(editor: PlateEditor<V>) => {
  resetEditorChildren(editor);

  editor.history.undos = [];
  editor.history.redos = [];
  editor.operations = [];
};
