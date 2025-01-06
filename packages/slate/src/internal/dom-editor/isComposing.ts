import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const isComposing = (editor: Editor) =>
  DOMEditor.isComposing(editor as any);
