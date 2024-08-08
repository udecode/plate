import type { TNode } from '@udecode/slate';
import type { Path } from 'slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Find the path of Slate node. */
export const findNodePath = (
  editor: TReactEditor,
  node: TNode
): Path | undefined => {
  try {
    return ReactEditor.findPath(editor as any, node);
  } catch (error) {}
};
