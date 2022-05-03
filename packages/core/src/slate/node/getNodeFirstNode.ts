import { Node, Path } from 'slate';
import { NodeOf, TNode } from '../types/TNode';
import { TNodeEntry } from '../types/TNodeEntry';

/**
 * Get the first node entry in a root node from a path.
 */
export const getNodeFirstNode = <N extends TNode>(root: N, path: Path) =>
  Node.first(root, path) as TNodeEntry<NodeOf<N>>;
