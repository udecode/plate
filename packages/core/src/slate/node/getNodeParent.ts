import { Node, Path } from 'slate';
import { AncestorOf } from '../types/TAncestor';
import { TNode } from '../types/TNode';

/**
 * Get the parent of a node at a specific path.
 */
export const getNodeParent = <N extends TNode>(root: N, path: Path) =>
  Node.parent(root, path) as AncestorOf<N>;
