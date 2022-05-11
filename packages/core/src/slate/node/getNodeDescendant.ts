import { Node, Path } from 'slate';
import { DescendantOf } from './TDescendant';
import { TNode } from './TNode';

/**
 * Get the node at a specific path, asserting that it's a descendant node.
 */
export const getNodeDescendant = <
  N extends DescendantOf<R>,
  R extends TNode = TNode
>(
  root: R,
  path: Path
) => Node.descendant(root, path) as N;
