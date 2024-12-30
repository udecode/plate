import { DOMEditor } from 'slate-dom';

import type { TEditor } from '../editor';
import type { TNode } from '../node';

export const findNodeKey = (editor: TEditor, node: TNode) => {
  try {
    return DOMEditor.findKey(editor as any, node);
  } catch (error) {}
};
