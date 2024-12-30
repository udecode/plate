import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const deselectEditor = (editor: TEditor) =>
  DOMEditor.deselect(editor as any);
