import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TNode } from '../../../../slate-utils/src/slate/node/TNode';
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
