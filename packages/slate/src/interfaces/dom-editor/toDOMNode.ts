import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';
import type { TNode } from '../node';

export const toDOMNode = (editor: TEditor, node: TNode) => {
  try {
    return DOMEditor.toDOMNode(editor as any, node);
  } catch (error) {}
};
