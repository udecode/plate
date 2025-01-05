import { DOMEditor } from 'slate-dom';

import type { TNode } from '../../interfaces';
import type { TEditor } from '../../interfaces/editor';

export const findNodeKey = (editor: TEditor, node: TNode) => {
  try {
    return DOMEditor.findKey(editor as any, node);
  } catch (error) {}
};
