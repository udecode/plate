import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';

export const findDocumentOrShadowRoot = (editor: Editor) => {
  try {
    return DOMEditor.findDocumentOrShadowRoot(editor as any);
  } catch {}
};
