import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../../interfaces/editor';
import type { TNode } from '../../interfaces/node';

export const toDOMNode = (editor: TEditor, node: TNode) => {
  try {
    return DOMEditor.toDOMNode(editor as any, node);
  } catch (error) {}
};
