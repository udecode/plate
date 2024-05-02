import { Node, type Range } from 'slate';

import type { ElementOf } from '../element/TElement';
import type { TextOf } from '../text/TText';
import type { TNode } from './TNode';

/** Get the sliced fragment represented by a range inside a root node. */
export const getNodeFragment = <
  N extends ElementOf<R> | TextOf<R>,
  R extends TNode = TNode,
>(
  root: R,
  range: Range
) => Node.fragment(root, range) as N[];
