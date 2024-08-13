import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Return the host window of the current editor. */
export const getEditorWindow = (editor: TReactEditor) => {
  try {
    return ReactEditor.getWindow(editor as any);
  } catch (error) {}
};
