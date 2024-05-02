import { Node, type Path } from 'slate';

import type { NodeOf, TNode } from './TNode';
import type { TNodeEntry } from './TNodeEntry';

/** Get the first node entry in a root node from a path. */
export const getNodeFirstNode = <N extends NodeOf<R>, R extends TNode = TNode>(
  root: R,
  path: Path
) => Node.first(root, path) as TNodeEntry<N>;
