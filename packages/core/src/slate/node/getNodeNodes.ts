import { Node } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { NodeOf, TNode } from '../types/TNode';
import { TNodeEntry } from '../types/TNodeEntry';

/**
 * Return a generator of all the node entries of a root node. Each entry is
 * returned as a `[Node, Path]` tuple, with the path referring to the node's
 * position inside the root node.
 */
export const getNodeNodes = <N extends TNode>(
  root: N,
  options: Modify<
    NonNullable<Parameters<typeof Node.nodes>[1]>,
    {
      pass?: (entry: TNodeEntry<NodeOf<N>>) => boolean;
    }
  >
) =>
  Node.nodes(root, options as any) as Generator<
    TNodeEntry<NodeOf<N>>,
    void,
    undefined
  >;
