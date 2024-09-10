import type { Path } from 'slate';

import type { TEditor } from '../editor/TEditor';
import type { ElementOf } from '../element/TElement';
import type { TextOf } from '../text/TText';
import type { AncestorOf } from './TAncestor';
import type { ChildOf, DescendantOf } from './TDescendant';
import type { NodeOf, TNode } from './TNode';

/**
 * `TNodeEntry` objects are returned when iterating over the nodes in a Slate
 * document tree. They consist of the node and its `Path` relative to the root
 * node in the document.
 */
export type TNodeEntry<N extends TNode = TNode> = [N, Path];

/** Node entry from an editor. */
export type NodeEntryOf<E extends TEditor> = TNodeEntry<NodeOf<E>>;

/** Element entry from a node. */
export type TElementEntry<N extends TNode = TNode> = TNodeEntry<ElementOf<N>>;

/** Element entry of a value. */
export type ElementEntryOf<E extends TEditor> = TNodeEntry<ElementOf<E>>;

/** Text node entry from a node. */
export type TTextEntry<N extends TNode = TNode> = TNodeEntry<TextOf<N>>;

/** Text node entry of a value. */
export type TextEntryOf<E extends TEditor> = TNodeEntry<TextOf<E>>;

/** Ancestor entry from a node. */
export type TAncestorEntry<N extends TNode = TNode> = TNodeEntry<AncestorOf<N>>;

/** Ancestor entry from an editor. */
export type AncestorEntryOf<E extends TEditor> = TAncestorEntry<E>;

/** Descendant entry from a node. */
export type TDescendantEntry<N extends TNode = TNode> = TNodeEntry<
  DescendantOf<N>
>;

/** Descendant entry of a value. */
export type DescendantEntryOf<E extends TEditor> = TNodeEntry<DescendantOf<E>>;

/** Child node entry from a node. */
export type TNodeChildEntry<N extends TNode = TNode> = TNodeEntry<ChildOf<N>>;
