import { Path } from 'slate';

import { TEditor, Value } from '../editor/TEditor';
import { EElement, ElementOf } from '../element/TElement';
import { EText, TextOf } from '../text/TText';
import { AncestorOf } from './TAncestor';
import { ChildOf, DescendantOf, EDescendant } from './TDescendant';
import { ENode, TNode } from './TNode';

/**
 * `TNodeEntry` objects are returned when iterating over the nodes in a Slate
 * document tree. They consist of the node and its `Path` relative to the root
 * node in the document.
 */
export type TNodeEntry<N extends TNode = TNode> = [N, Path];

/**
 * Node entry from an editor.
 */
export type ENodeEntry<V extends Value> = TNodeEntry<ENode<V>>;

/**
 * Element entry from a node.
 */
export type TElementEntry<N extends TNode = TNode> = TNodeEntry<ElementOf<N>>;

/**
 * Element entry from an editor.
 */
// export type EElementEntry<V extends Value> = TElementEntry<TEditor<V>>;

/**
 * Element entry of a value.
 */
export type EElementEntry<V extends Value> = TNodeEntry<EElement<V>>;

/**
 * Text node entry from a node.
 */
export type TTextEntry<N extends TNode = TNode> = TNodeEntry<TextOf<N>>;

/**
 * Text node entry from an editor.
 */
// export type ETextEntry<V extends Value> = TTextEntry<TEditor<V>>;

/**
 * Text node entry of a value.
 */
export type ETextEntry<V extends Value> = TNodeEntry<EText<V>>;

/**
 * Ancestor entry from a node.
 */
export type TAncestorEntry<N extends TNode = TNode> = TNodeEntry<AncestorOf<N>>;

/**
 * Ancestor entry from an editor.
 */
export type EAncestorEntry<V extends Value> = TAncestorEntry<TEditor<V>>;

/**
 * Descendant entry from a node.
 */
export type TDescendantEntry<N extends TNode = TNode> = TNodeEntry<
  DescendantOf<N>
>;

/**
 * Descendant entry from an editor.
 */
// export type EDescendantEntry<V extends Value> = TDescendantEntry<TEditor<V>>;

/**
 * Descendant entry of a value.
 */
export type EDescendantEntry<V extends Value> = TNodeEntry<EDescendant<V>>;

/**
 * Child node entry from a node.
 */
export type TNodeChildEntry<N extends TNode = TNode> = TNodeEntry<ChildOf<N>>;
