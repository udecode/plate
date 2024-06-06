import { Node, type Path } from 'slate';

import type { AncestorOf } from './TAncestor';
import type { TNode } from './TNode';

/** Get the node at a specific path, asserting that it's an ancestor node. */
export const getNodeAncestor = <
  N extends AncestorOf<R>,
  R extends TNode = TNode,
>(
  root: R,
  path: Path
) => Node.ancestor(root, path) as N;
