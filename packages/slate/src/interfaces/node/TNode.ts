import type { Path } from 'slate';

import type { TEditor } from '../editor/TEditor';
import type { ElementOf, TElement } from '../element/TElement';
import type { TText, TextOf } from '../text/TText';

export type TNode = TEditor | TElement | TText;

/** A utility type to get all the node types from a root node type. */
export type NodeOf<N extends TNode> = ElementOf<N> | N | TextOf<N>;

/** Convenience type for returning the props of a node. */
export type TNodeProps<N extends TNode> = N extends TEditor
  ? Omit<N, 'children'>
  : N extends TElement
    ? Omit<N, 'children'>
    : Omit<N, 'text'>;

/** A helper type for narrowing matched nodes with a predicate. */
export type TNodeMatch<N extends TNode = TNode> =
  | ((node: N, path: Path) => boolean)
  | ((node: N, path: Path) => node is N);
