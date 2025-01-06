import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const isEditorReadOnly = (editor: Editor) =>
  DOMEditor.isReadOnly(editor as any);
