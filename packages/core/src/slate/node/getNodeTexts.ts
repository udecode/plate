import { Node } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { NodeOf, TNode } from '../types/TNode';
import { TNodeEntry, TTextEntry } from '../types/TNodeEntry';

/**
 * Return a generator of all leaf text nodes in a root node.
 */
export const getNodeTexts = <N extends TNode>(
  root: N,
  options?: Modify<
    NonNullable<Parameters<typeof Node.texts>[1]>,
    {
      pass?: (entry: TNodeEntry<NodeOf<N>>) => boolean;
    }
  >
) =>
  Node.texts(root, options as any) as Generator<TTextEntry<N>, void, undefined>;
