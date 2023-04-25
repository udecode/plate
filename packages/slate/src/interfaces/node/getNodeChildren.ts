import { Node, NodeChildrenOptions, Path } from 'slate';
import { ChildOf } from './TDescendant';
import { TNode } from './TNode';
import { TNodeEntry } from './TNodeEntry';

/**
 * Iterate over the children of a node at a specific path.
 */
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
