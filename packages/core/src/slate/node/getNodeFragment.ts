import { Node, Range } from 'slate';
import { ElementOf } from '../types/TElement';
import { TNode } from '../types/TNode';
import { TextOf } from '../types/TText';

/**
 * Get the sliced fragment represented by a range inside a root node.
 */
export const getNodeFragment = <N extends TNode>(root: N, range: Range) =>
  Node.fragment(root, range) as Array<ElementOf<N> | TextOf<N>>;
