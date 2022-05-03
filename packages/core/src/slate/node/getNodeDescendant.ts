import { Node, Path } from 'slate';
import { DescendantOf } from '../types/TDescendant';
import { TNode } from '../types/TNode';

/**
 * Get the node at a specific path, asserting that it's a descendant node.
 */
export const getNodeDescendant = <N extends TNode>(root: N, path: Path) =>
  Node.descendant(root, path) as DescendantOf<N>;
