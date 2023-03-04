import { TNode, Value } from '@udecode/slate-utils';
import { ReactEditor } from 'slate-react';
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
