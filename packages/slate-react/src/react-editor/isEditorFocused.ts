import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Check if the editor is focused. */
export const isEditorFocused = (editor: TReactEditor) =>
  ReactEditor.isFocused(editor as any);
