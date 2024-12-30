import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';

export const isComposing = (editor: TEditor) =>
  DOMEditor.isComposing(editor as any);
