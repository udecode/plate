import type { DOMNode } from 'slate-dom';

import { DOMEditor } from 'slate-dom';

import type { Editor } from '../../interfaces/editor';
import type { TNode } from '../../interfaces/node';

export const toSlateNode = (editor: Editor, domNode: DOMNode) => {
  try {
    return DOMEditor.toSlateNode(editor as any, domNode) as TNode;
  } catch {}
};
