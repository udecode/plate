import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';
import type { TNode } from '../../interfaces/node';

export const toDOMNode = (editor: Editor, node: TNode) => {
  try {
    return DOMEditor.toDOMNode(editor as any, node);
  } catch {}
};
