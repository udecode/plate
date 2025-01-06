import type { Path } from 'slate';

import type { Editor, Value } from '../editor/editor';
import type { ElementOf, TElement } from '../element/TElement';
import type { TText, TextOf } from '../text/TText';

export type TNode = Editor | TElement | TText;

/** A utility type to get all the node types from a root node type. */
export type NodeOf<N extends TNode> = ElementOf<N> | N | TextOf<N>;

/** A utility type to get all possible node types from a Value type */
export type NodeIn<V extends Value> = NodeOf<Editor | V[number]>;

/** Convenience type for returning the props of a node. */
export type TNodeProps<N extends TNode> = N extends Editor
  ? Omit<N, 'children'>
  : N extends TElement
    ? Omit<N, 'children'>
    : Omit<N, 'text'>;

/** A helper type for narrowing matched nodes with a predicate. */
export type TNodeMatch<N extends TNode = TNode> =
  | ((node: N, path: Path) => boolean)
  | ((node: N, path: Path) => node is N);
