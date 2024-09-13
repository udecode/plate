import type { Modify } from '@udecode/utils';

import { type NodeElementsOptions, Node } from 'slate';

import type { ElementOf } from '../element/TElement';
import type { TNode } from './TNode';
import type { TElementEntry, TNodeEntry } from './TNodeEntry';

/**
 * Return a generator of all the element nodes inside a root node. Each
 * iteration will return an `ElementEntry` tuple consisting of `[Element,
 * Path]`. If the root node is an element it will be included in the iteration
 * as well.
 */
export const getNodeElements = <
  N extends ElementOf<R>,
  R extends TNode = TNode,
>(
  root: R,
  options?: Modify<
    NonNullable<NodeElementsOptions>,
    {
      pass?: (node: TElementEntry<N>) => boolean;
    }
  >
) =>
  Node.elements(root, options as any) as Generator<
    TNodeEntry<N>,
    void,
    undefined
  >;
