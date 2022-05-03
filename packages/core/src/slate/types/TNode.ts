import { Path } from 'slate';
import { TEditor, Value } from './TEditor';
import { ElementOf, TElement } from './TElement';
import { TextOf, TText } from './TText';

export type TNode = TEditor<Value> | TElement | TText;

/**
 * Node of an editor.
 */
export type ENode<V extends Value> = NodeOf<TEditor<V>>;

/**
 * A utility type to get all the node types from a root node type.
 */
export type NodeOf<N extends TNode> = N | ElementOf<N> | TextOf<N>;

/**
 * Convenience type for returning the props of a node.
 */
export type TNodeProps<N extends TNode> = N extends TEditor<Value>
  ? Omit<N, 'children'>
  : N extends TElement
  ? Omit<N, 'children'>
  : Omit<N, 'text'>;

/**
 * A helper type for narrowing matched nodes with a predicate.
 */
export type TNodeMatch<N extends TNode> =
  | ((node: N, path: Path) => node is N)
  | ((node: N, path: Path) => boolean);
