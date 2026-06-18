import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const isReadOnly = (editor: Editor) =>
  DOMEditor.isReadOnly(editor as any);
