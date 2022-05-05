import { Node } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { TNode } from '../types/TNode';
import { TDescendantEntry, TElementEntry } from '../types/TNodeEntry';

/**
 * Return a generator of all the element nodes inside a root node. Each iteration
 * will return an `ElementEntry` tuple consisting of `[Element, Path]`. If the
 * root node is an element it will be included in the iteration as well.
 */
export const getNodeElements = <N extends TNode>(
  root: N,
  options?: Modify<
    NonNullable<Parameters<typeof Node.elements>[1]>,
    {
      pass?: (node: TElementEntry<N>) => boolean;
    }
  >
) =>
  Node.elements(root, options as any) as Generator<
    TDescendantEntry<N>,
    void,
    undefined
  >;
