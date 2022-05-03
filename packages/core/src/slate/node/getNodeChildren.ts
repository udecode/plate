import { Node, Path } from 'slate';
import { TNode } from '../types/TNode';
import { TNodeChildEntry } from '../types/TNodeEntry';

/**
 * Iterate over the children of a node at a specific path.
 */
export const getNodeChildren = <N extends TNode>(
  root: N,
  path: Path,
  options: Parameters<typeof Node.children>[2]
) =>
  Node.children(root, path, options) as Generator<
    TNodeChildEntry<N>,
    void,
    undefined
  >;
