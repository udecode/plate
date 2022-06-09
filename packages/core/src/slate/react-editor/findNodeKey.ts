import { ReactEditor } from 'slate-react';
import { Value } from '../editor/TEditor';
import { TNode } from '../node/TNode';
import { TReactEditor } from './TReactEditor';

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
