import { Node, type NodeChildrenOptions, type Path } from 'slate';

import type { ChildOf } from './TDescendant';
import type { TNode } from './TNode';
import type { TNodeEntry } from './TNodeEntry';

/** Iterate over the children of a node at a specific path. */
export const getNodeChildren = <N extends ChildOf<R>, R extends TNode = TNode>(
  root: R,
  path: Path,
  options?: NodeChildrenOptions
) =>
  Node.children(root, path, options) as Generator<
    TNodeEntry<N>,
    void,
    undefined
  >;
