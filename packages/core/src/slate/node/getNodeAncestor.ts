import { Node, Path } from 'slate';
import { AncestorOf } from '../types/TAncestor';
import { TNode } from '../types/TNode';

/**
 * Get the node at a specific path, asserting that it's an ancestor node.
 */
export const getNodeAncestor = <N extends TNode>(root: N, path: Path) =>
  Node.ancestor(root, path) as AncestorOf<N>;
