import { Node } from 'slate';
import { ChildOf } from '../types/TDescendant';
import { TNode } from '../types/TNode';

/**
 * Get the child of a node at a specific index.
 */
export const getNodeChild = <N extends TNode, I extends number>(
  root: N,
  index: I
) => Node.child(root, index) as ChildOf<N, I>;
