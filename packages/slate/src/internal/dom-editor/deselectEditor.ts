import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';

export const deselectEditor = (editor: TEditor) =>
  DOMEditor.deselect(editor as any);
