import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const findEventRange = (editor: Editor, event: any) => {
  try {
    return DOMEditor.findEventRange(editor as any, event);
  } catch {}
};
