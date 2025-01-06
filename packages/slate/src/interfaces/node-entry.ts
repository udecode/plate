import type { Path } from 'slate';

import type { Editor, Value } from './editor/editor';
import type { ElementOf } from './element/TElement';
import type { NodeIn, NodeOf, TNode } from './node';
import type { AncestorOf } from './node/TAncestor';
import type { ChildOf, DescendantIn, DescendantOf } from './node/TDescendant';
import type { TextIn, TextOf } from './text';

/**
 * `TNodeEntry` objects are returned when iterating over the nodes in a Slate
 * document tree. They consist of the node and its `Path` relative to the root
 * node in the document.
 */
export type TNodeEntry<N extends TNode = TNode> = [N, Path];

/** Node entry from an editor. */
export type NodeEntryOf<E extends Editor> = TNodeEntry<NodeOf<E>>;

export type NodeEntryIn<V extends Value> = TNodeEntry<NodeIn<V>>;

/** Element entry from a node. */
export type TElementEntry<N extends TNode = TNode> = TNodeEntry<ElementOf<N>>;

/** Element entry of a value. */
export type ElementEntryOf<E extends Editor> = TNodeEntry<ElementOf<E>>;

/** Text node entry from a node. */
export type TTextEntry<N extends TNode = TNode> = TNodeEntry<TextOf<N>>;

/** Text node entry of a value. */
export type TextEntryOf<E extends Editor> = TNodeEntry<TextOf<E>>;

export type TextEntryIn<V extends Value> = TNodeEntry<TextIn<V>>;

/** Ancestor entry from a node. */
export type TAncestorEntry<N extends TNode = TNode> = TNodeEntry<AncestorOf<N>>;

/** Ancestor entry from an editor. */
export type AncestorEntryOf<E extends Editor> = TAncestorEntry<E>;

/** Descendant entry from a node. */
export type TDescendantEntry<N extends TNode = TNode> = TNodeEntry<
  DescendantOf<N>
>;

/** Descendant entry of a value. */
export type DescendantEntryOf<E extends Editor> = TNodeEntry<DescendantOf<E>>;

export type DescendantEntryIn<V extends Value> = TNodeEntry<DescendantIn<V>>;

/** Child node entry from a node. */
export type TNodeChildEntry<N extends TNode = TNode> = TNodeEntry<ChildOf<N>>;
