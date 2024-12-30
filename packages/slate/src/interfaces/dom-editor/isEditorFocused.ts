import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const isEditorFocused = (editor: TEditor) =>
  DOMEditor.isFocused(editor as any);
