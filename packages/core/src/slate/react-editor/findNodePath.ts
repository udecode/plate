import { Path } from 'slate';
import { ReactEditor } from 'slate-react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { TNode } from '../../../../slate-utils/src/slate/node/TNode';
import { TReactEditor } from './TReactEditor';

/**
 * Find the path of Slate node.
 */
export const findNodePath = <V extends Value>(
  editor: TReactEditor<V>,
  node: TNode
): Path | undefined => {
  try {
    return ReactEditor.findPath(editor as any, node);
  } catch (e) {}
};
