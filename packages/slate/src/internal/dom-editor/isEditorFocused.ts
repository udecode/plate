import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const isEditorFocused = (editor: Editor) =>
  DOMEditor.isFocused(editor as any);
