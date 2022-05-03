import { Node, Path } from 'slate';
import { NodeOf, TNode } from '../types/TNode';

/**
 * Get the descendant node referred to by a specific path.
 * If the path is an empty array, it refers to the root node itself.
 * If the node is not found, return null.
 */
export const getNodeNode = <N extends TNode>(root: N, path: Path) => {
  try {
    return Node.get(root, path) as NodeOf<N>;
  } catch (err) {
    return null;
  }
};
