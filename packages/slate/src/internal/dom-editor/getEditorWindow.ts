import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';

export const getEditorWindow = (editor: TEditor) => {
  try {
    return DOMEditor.getWindow(editor as any);
  } catch (error) {}
};
