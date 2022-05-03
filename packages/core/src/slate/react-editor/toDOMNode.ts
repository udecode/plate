import { ReactEditor } from 'slate-react';
import { Value } from '../types/TEditor';
import { TNode } from '../types/TNode';
import { TReactEditor } from '../types/TReactEditor';

/**
 * Find the native DOM element from a Slate node.
 */
export const toDOMNode = <V extends Value>(
  editor: TReactEditor<V>,
  node: TNode
) => {
  try {
    return ReactEditor.toDOMNode(editor as any, node);
  } catch (e) {}
};
