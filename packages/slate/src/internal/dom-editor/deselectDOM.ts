import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const deselectDOM = (editor: Editor) =>
  DOMEditor.deselect(editor as any);
