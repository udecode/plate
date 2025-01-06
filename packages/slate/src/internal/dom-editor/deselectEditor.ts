import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const deselectEditor = (editor: Editor) =>
  DOMEditor.deselect(editor as any);
