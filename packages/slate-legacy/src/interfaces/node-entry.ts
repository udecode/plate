import type { Editor, Value } from './editor/editor-type';
import type { ElementOf } from './element';
import type {
  AncestorOf,
  ChildOf,
  DescendantIn,
  DescendantOf,
  NodeIn,
  NodeOf,
  TNode,
} from './node';
import type { Path } from './path';
import type { TextIn, TextOf } from './text';

/** Ancestor entry from a node. */
export type AncestorEntry<N extends TNode = TNode> = NodeEntry<AncestorOf<N>>;

/** Ancestor entry from an editor. */
export type AncestorEntryOf<E extends Editor> = AncestorEntry<E>;

/** Descendant entry from a node. */
export type DescendantEntry<N extends TNode = TNode> = NodeEntry<
  DescendantOf<N>
>;

/** Descendant entry of a value. */
export type DescendantEntryIn<V extends Value> = NodeEntry<DescendantIn<V>>;

export type DescendantEntryOf<E extends Editor> = NodeEntry<DescendantOf<E>>;

/**
 * `ElementEntry` objects refer to an `Element` and the `Path` where it can be
 * found inside a root node.
 */
export type ElementEntry<N extends TNode = TNode> = NodeEntry<ElementOf<N>>;

/** Element entry of a value. */
export type ElementEntryOf<E extends Editor> = NodeEntry<ElementOf<E>>;

/** Child node entry from a node. */
export type NodeChildEntry<N extends TNode = TNode> = NodeEntry<ChildOf<N>>;

/**
 * `NodeEntry` objects are returned when iterating over the nodes in a Slate
 * document tree. They consist of the node and its `Path` relative to the root
 * node in the document.
 */
export type NodeEntry<N extends TNode = TNode> = [N, Path];

/** Node entry from an editor. */
export type NodeEntryIn<V extends Value> = NodeEntry<NodeIn<V>>;

export type NodeEntryOf<E extends Editor> = NodeEntry<NodeOf<E>>;

/**
 * `TextEntry` objects refer to a `Text` and the `Path` where it can be found
 * inside an element node.
 */
export type TextEntry<N extends TNode = TNode> = NodeEntry<TextOf<N>>;

/** Text node entry of a value. */
export type TextEntryIn<V extends Value> = NodeEntry<TextIn<V>>;

export type TextEntryOf<E extends Editor> = NodeEntry<TextOf<E>>;
