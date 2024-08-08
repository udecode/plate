import type { TNode } from '@udecode/slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Find a key for a Slate node. */
export const findNodeKey = (editor: TReactEditor, node: TNode) => {
  try {
    return ReactEditor.findKey(editor as any, node);
  } catch (error) {}
};
