import { Node, type Path } from 'slate';

import type { DescendantOf } from './TDescendant';
import type { TNode } from './TNode';

/** Get the node at a specific path, asserting that it's a descendant node. */
export const getNodeDescendant = <
  N extends DescendantOf<R>,
  R extends TNode = TNode,
>(
  root: R,
  path: Path
) => Node.descendant(root, path) as N;
