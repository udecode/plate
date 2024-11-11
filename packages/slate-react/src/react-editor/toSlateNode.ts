import type { TEditor, TNode } from '@udecode/slate';
import type { DOMNode } from 'slate-dom';

import { ReactEditor } from 'slate-react';

/** {@link ReactEditor.toSlateNode} */
export const toSlateNode = (editor: TEditor, domNode: DOMNode) => {
  try {
    return ReactEditor.toSlateNode(editor as any, domNode) as TNode;
  } catch (error) {}
};
