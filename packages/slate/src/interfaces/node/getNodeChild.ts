import { Node } from 'slate';

import { ChildOf } from './TDescendant';
import { TNode } from './TNode';

/**
 * Get the child of a node at a specific index.
 */
export const getNodeChild = <
  N extends ChildOf<R, I>,
  R extends TNode = TNode,
  I extends number = number
>(
  root: R,
  index: I
) => Node.child(root, index) as N;
