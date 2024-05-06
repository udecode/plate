import type { TNode, Value } from '@udecode/slate';
import type { Path } from 'slate';

import { ReactEditor } from 'slate-react';

import type { TReactEditor } from '../types/TReactEditor';

/** Find the path of Slate node. */
export const findNodePath = <V extends Value>(
  editor: TReactEditor<V>,
  node: TNode
): Path | undefined => {
  try {
    return ReactEditor.findPath(editor as any, node);
  } catch (error) {}
};
