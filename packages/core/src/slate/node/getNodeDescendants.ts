import { Node } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { DescendantOf } from './TDescendant';
import { TNode } from './TNode';
import { TDescendantEntry, TNodeEntry } from './TNodeEntry';

/**
 * Return a generator of all the descendant node entries inside a root node.
 */
export const getNodeDescendants = <
  N extends DescendantOf<R>,
  R extends TNode = TNode
>(
  root: R,
  options?: Modify<
    NonNullable<Parameters<typeof Node.descendants>[1]>,
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
