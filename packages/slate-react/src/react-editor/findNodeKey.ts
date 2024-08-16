import type { TEditor, TNode } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

/** Find a key for a Slate node. */
export const findNodeKey = (editor: TEditor, node: TNode) => {
  try {
    return ReactEditor.findKey(editor as any, node);
  } catch (error) {}
};
