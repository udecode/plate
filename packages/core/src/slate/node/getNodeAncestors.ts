import { Node, Path } from 'slate';
import { TNode } from '../types/TNode';
import { TAncestorEntry } from '../types/TNodeEntry';

/**
 * Return a generator of all the ancestor nodes above a specific path.
 *
 * By default the order is bottom-up, from lowest to highest ancestor in
 * the tree, but you can pass the `reverse: true` option to go top-down.
 */
export const getNodeAncestors = <N extends TNode>(
  root: N,
  path: Path,
  options?: Parameters<typeof Node.ancestors>[2]
) =>
  Node.ancestors(root, path, options) as Generator<
    TAncestorEntry<N>,
    void,
    undefined
  >;
