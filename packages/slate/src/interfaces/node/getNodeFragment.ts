import { Node, Range } from 'slate';

import { ElementOf } from '../element/TElement';
import { TextOf } from '../text/TText';
import { TNode } from './TNode';

/**
 * Get the sliced fragment represented by a range inside a root node.
 */
export const getNodeFragment = <
  N extends ElementOf<R> | TextOf<R>,
  R extends TNode = TNode
>(
  root: R,
  range: Range
) => Node.fragment(root, range) as Array<N>;
