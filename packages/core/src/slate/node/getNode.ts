import { Node, Path } from 'slate';
import { NodeOf, TNode } from './TNode';

/**
 * Get the descendant node referred to by a specific path.
 * If the path is an empty array, it refers to the root node itself.
 * If the node is not found, return null.
 */
export const getNode = <N extends NodeOf<R>, R extends TNode = TNode>(
  root: R,
  path: Path
) => {
  try {
    return Node.get(root, path) as N;
  } catch (err) {
    return null;
  }
};
