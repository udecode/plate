import { type Path, Node } from 'slate';

import type { NodeOf, TNode } from './TNode';
import type { TNodeEntry } from './TNodeEntry';

/** Get the last node entry in a root node from a path. */
export const getNodeLastNode = <N extends NodeOf<R>, R extends TNode = TNode>(
  root: R,
  path: Path
) => Node.last(root, path) as TNodeEntry<N>;
