import { Node, Path } from 'slate';
import { NodeOf, TNode } from '../types/TNode';
import { TNodeEntry } from '../types/TNodeEntry';

/**
 * Return a generator of the in a branch of the tree, from a specific path.
 *
 * By default the order is top-down, from lowest to highest node in the tree,
 * but you can pass the `reverse: true` option to go bottom-up.
 */
export const getNodeLevels = <N extends TNode>(
  root: N,
  path: Path,
  options: Parameters<typeof Node.levels>[2]
) =>
  Node.levels(root, path, options) as Generator<
    TNodeEntry<NodeOf<N>>,
    void,
    undefined
  >;
