import { DOMEditor } from 'slate-dom';

import type { TNode } from '../../interfaces';
import type { Editor } from '../../interfaces/editor';

export const findKey = (editor: Editor, node: TNode) => {
  try {
    return DOMEditor.findKey(editor as any, node);
  } catch {}
};
