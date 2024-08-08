import type { TNode } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Find the native DOM element from a Slate node. */
export const toDOMNode = (editor: TReactEditor, node: TNode) => {
  try {
    return ReactEditor.toDOMNode(editor as any, node);
  } catch (error) {}
};
