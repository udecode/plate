import type { Modify } from '@udecode/utils';

import { type NodeDescendantsOptions, Node } from 'slate';

import type { DescendantOf } from './TDescendant';
import type { TNode } from './TNode';
import type { TDescendantEntry, TNodeEntry } from './TNodeEntry';

/** Return a generator of all the descendant node entries inside a root node. */
export const getNodeDescendants = <
  N extends DescendantOf<R>,
  R extends TNode = TNode,
>(
  root: R,
  options?: Modify<
    NonNullable<NodeDescendantsOptions>,
    {
      pass?: (node: TDescendantEntry<N>) => boolean;
    }
  >
) =>
  Node.descendants(root, options as any) as Generator<
    TNodeEntry<N>,
    void,
    undefined
  >;
