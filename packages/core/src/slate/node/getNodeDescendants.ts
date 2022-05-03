import { Node } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { TNode } from '../types/TNode';
import { TDescendantEntry } from '../types/TNodeEntry';

/**
 * Return a generator of all the descendant node entries inside a root node.
 */
export const getNodeDescendants = <N extends TNode>(
  root: N,
  options: Modify<
    NonNullable<Parameters<typeof Node.descendants>[1]>,
    {
      pass?: (node: TDescendantEntry<N>) => boolean;
    }
  >
) =>
  Node.descendants(root, options as any) as Generator<
    TDescendantEntry<N>,
    void,
    undefined
  >;
