import { ReactEditor } from 'slate-react';
import { Value } from '../types/TEditor';
import { TNode } from '../types/TNode';
import { TReactEditor } from '../types/TReactEditor';

/**
 * Find a key for a Slate node.
 */
export const findNodeKey = <V extends Value>(
  editor: TReactEditor<V>,
  node: TNode
) => {
  try {
    return ReactEditor.findKey(editor as any, node);
  } catch (e) {}
};
