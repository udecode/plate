import { Node, Path } from 'slate';
import { NodeOf, TNode } from '../types/TNode';
import { TNodeEntry } from '../types/TNodeEntry';

/**
 * Get the last node entry in a root node from a path.
 */
export const getNodeLastNode = <N extends TNode>(root: N, path: Path) =>
  Node.last(root, path) as TNodeEntry<NodeOf<N>>;
