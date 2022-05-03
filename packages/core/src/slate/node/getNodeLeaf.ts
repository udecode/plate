import { Node, Path } from 'slate';
import { TNode } from '../types/TNode';
import { TextOf } from '../types/TText';

/**
 * Get the node at a specific path, ensuring it's a leaf text node.
 */
export const getNodeLeaf = <N extends TNode>(root: N, path: Path) =>
  Node.leaf(root, path) as TextOf<N>;
