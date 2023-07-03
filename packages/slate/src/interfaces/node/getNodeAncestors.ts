import { Node, NodeAncestorsOptions, Path } from 'slate';

import { AncestorOf } from './TAncestor';
import { TNode } from './TNode';
import { TNodeEntry } from './TNodeEntry';

/**
 * Return a generator of all the ancestor nodes above a specific path.
 *
 * By default the order is bottom-up, from lowest to highest ancestor in
 * the tree, but you can pass the `reverse: true` option to go top-down.
 */
export const getNodeAncestors = <
  N extends AncestorOf<R>,
  R extends TNode = TNode
>(
  root: R,
  path: Path,
  options?: NodeAncestorsOptions
) =>
  Node.ancestors(root, path, options) as Generator<
    TNodeEntry<N>,
    void,
    undefined
  >;
