import { Node as SlateNode } from 'slate';

import type { Editor, Value } from './editor/editor-type';
import type { NodeEntry } from './node-entry';
import type { Path } from './path';
import type { TRange } from './range';

import { NodeExtension } from '../internal/editor-extension/node-extension';
import { type ElementOf, type TElement, ElementApi } from './element';
import { type TextOf, type TText, TextApi } from './text';

/**
 * The `Ancestor` union type represents nodes that are ancestors in the tree. It
 * is returned as a convenience in certain cases to narrow a value further than
 * the more generic `Node` union.
 */
export type Ancestor = Editor | TElement;

/**
 * The `Descendant` union type represents nodes that are descendants in the
 * tree. It is returned as a convenience in certain cases to narrow a value
 * further than the more generic `Node` union.
 */

export type Descendant = TElement | TText;

/** Convenience type for returning the props of a node. */
export type NodeProps<N extends TNode = TNode> = N extends Editor
  ? Omit<N, 'children'>
  : N extends TElement
    ? Omit<N, 'children'>
    : Omit<N, 'text'>;

/**
 * The `TNode` union type represents all of the different types of nodes that
 * occur in a Slate document tree.
 */
export type TNode = Editor | TElement | TText;

export const NodeApi: {
  /** Get the node at a specific path, asserting that it's an ancestor node. */
  ancestor: <N extends AncestorOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => N | undefined;
  /**
   * Return a generator of all the ancestor nodes above a specific path.
   *
   * By default the order is bottom-up, from lowest to highest ancestor in the
   * tree, but you can pass the `reverse: true` option to go top-down.
   */
  ancestors: <N extends AncestorOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path,
    options?: NodeAncestorsOptions
  ) => Generator<NodeEntry<N>, void, undefined>;
  /** Get the child of a node at a specific index. */
  child: <
    N extends ChildOf<R, I>,
    R extends TNode = TNode,
    I extends number = number,
  >(
    root: R,
    index: I
  ) => N | undefined;
  /** Iterate over the children of a node at a specific path. */
  children: <N extends ChildOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path,
    options?: NodeChildrenOptions
  ) => Generator<NodeEntry<N>, void, undefined>;
  /** Get an entry for the common ancestor node of two paths. */
  common: <N extends NodeOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path,
    another: Path
  ) => NodeEntry<N> | undefined;
  /** Get the node at a specific path, asserting that it's a descendant node. */
  descendant: <N extends DescendantOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => N | undefined;
  /** Return a generator of all the descendant node entries inside a root node. */
  descendants: <N extends DescendantOf<R>, R extends TNode = TNode>(
    root: R,
    options?: NodeDescendantsOptions<R>
  ) => Generator<NodeEntry<N>, void, undefined>;
  /**
   * Return a generator of all the element nodes inside a root node. Each
   * iteration will return an `ElementEntry` tuple consisting of `[Element,
   * Path]`. If the root node is an element it will be included in the iteration
   * as well.
   */
  elements: <N extends ElementOf<R>, R extends TNode = TNode>(
    root: R,
    options?: NodeElementsOptions<R>
  ) => Generator<NodeEntry<N>, void, undefined>;
  /** Extract props from a TNode. */
  extractProps: <N extends TNode>(node: N) => NodeProps<N>;
  /** Get the first node entry in a root node from a path. */
  first: <N extends NodeOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => NodeEntry<N> | undefined;
  /** Get the first child node entry of a node. */
  firstChild: <N extends ChildOf<R, 0>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => NodeEntry<N> | undefined;
  /** Get the first text node entry of a node. */
  firstText: <N extends TextOf<R>, R extends TNode = TNode>(
    root: R,
    options?: NodeTextsOptions<R>
  ) => NodeEntry<N> | undefined;
  /** Get the sliced fragment represented by a range inside a root node. */
  fragment: <N extends ElementOf<R> | TextOf<R>, R extends TNode = TNode>(
    root: R,
    range: TRange
  ) => N[];
  /**
   * Get the descendant node referred to by a specific path. If the path is an
   * empty array, it refers to the root node itself.
   */
  get: <N extends NodeOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => N | undefined;
  /** Similar to get, but returns undefined if the node does not exist. */
  getIf: (root: TNode, path: Path) => TNode | undefined;
  /** Check if a descendant node exists at a specific path. */
  has: (root: TNode, path: Path) => boolean;
  /** Check if a node has a single child */
  hasSingleChild: (node: TNode) => boolean;
  /** Check if a value implements the 'Ancestor' interface */
  isAncestor: <N extends Ancestor>(value: any) => value is N;
  /** Check if a value implements the 'Descendant' interface. */
  isDescendant: <N extends Descendant>(value: any) => value is N;
  /** Check if a value implements the `Editor` interface. */
  isEditor: (value: any) => value is Editor;
  /** Check if a node is the last child of its parent. */
  isLastChild: (root: TNode, path: Path) => boolean;
  /** Check if a value implements the `TNode` interface. */
  isNode: <N extends TNode>(value: any) => value is N;
  /** Check if a value is a list of `Descendant` objects. */
  isNodeList: <N extends Descendant>(value: any) => value is N[];
  /** Get the last node entry in a root node from a path. */
  last: <N extends NodeOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => NodeEntry<N> | undefined;
  /** Get the last child node entry of a node. */
  lastChild: <N extends ChildOf<R, -1>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => NodeEntry<N> | undefined;
  /** Get the node at a specific path, ensuring it's a leaf text node. */
  leaf: <N extends TextOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => N | undefined;
  /**
   * Return a generator of the in a branch of the tree, from a specific path.
   *
   * By default the order is top-down, from highest to lowest node in the tree,
   * but you can pass the `reverse: true` option to go bottom-up.
   */
  levels: <N extends NodeOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path,
    options?: NodeLevelsOptions
  ) => Generator<NodeEntry<N>, void, undefined>;
  /** Check if a node matches a set of props. */
  matches: (node: Descendant, props: Partial<Descendant>) => boolean;
  /**
   * Return a generator of all the node entries of a root node. Each entry is
   * returned as a `[TNode, Path]` tuple, with the path referring to the node's
   * position inside the root node.
   */
  nodes: <N extends NodeOf<R>, R extends TNode = TNode>(
    root: R,
    options?: NodeNodesOptions<R>
  ) => Generator<NodeEntry<N>, void, undefined>;
  /** Get the parent of a node at a specific path. */
  parent: <N extends AncestorOf<R>, R extends TNode = TNode>(
    root: R,
    path: Path
  ) => N | undefined;
  /**
   * Get the concatenated text string of a node's content.
   *
   * Note that this will not include spaces or line breaks between block nodes.
   * It is not a user-facing string, but a string for performing offset-related
   * computations for a node.
   */
  string: (node: TNode) => string;
  /** Return a generator of all leaf text nodes in a root node. */
  texts: <N extends TextOf<R>, R extends TNode = TNode>(
    root: R,
    options?: NodeTextsOptions<R>
  ) => Generator<NodeEntry<N>, void, undefined>;
} = {
  ...(SlateNode as any),
  isAncestor: ElementApi.isAncestor,
  ancestor: (...args) => {
    try {
      return SlateNode.ancestor(...args);
    } catch {}
  },
  common: (...args) => {
    try {
      return SlateNode.common(...args);
    } catch {}
  },
  descendant: (...args) => {
    try {
      return SlateNode.descendant(...args);
    } catch {}
  },
  first: (...args) => {
    try {
      return SlateNode.first(...args);
    } catch {}
  },
  fragment: (...args) => {
    try {
      return SlateNode.fragment(...args);
    } catch {
      return [];
    }
  },
  get: (...args) => {
    try {
      return SlateNode.get(...args);
    } catch {}
  },
  hasSingleChild: (node) => {
    if (TextApi.isText(node)) return true;

    return (
      node.children.length === 1 && NodeApi.hasSingleChild(node.children[0])
    );
  },
  isDescendant: (node) => ElementApi.isElement(node) || TextApi.isText(node),
  last: (...args) => {
    try {
      return SlateNode.last(...args);
    } catch {}
  },
  leaf: (...args) => {
    try {
      return SlateNode.leaf(...args);
    } catch {}
  },
  parent: (...args) => {
    try {
      return SlateNode.parent(...args);
    } catch {}
  },
  ...NodeExtension,
};

/** A utility type to get all the ancestor node types from a root node type. */
export type AncestorIn<V extends Value> = AncestorOf<Editor | V[number]>;

export type AncestorOf<N extends TNode> = Editor extends N
  ? Editor | TElement
  : TElement extends N
    ? TElement
    : N extends Editor
      ? ElementOf<N['children'][number]> | N | N['children'][number]
      : N extends TElement
        ? ElementOf<N> | N
        : never;

/** A utility type to get the child node types from a root node type. */
export type ChildOf<
  N extends TNode,
  I extends number = number,
> = N extends Editor
  ? N['children'][I]
  : N extends TElement
    ? N['children'][I]
    : never;

/** A utility type to get all the descendant node types from a root node type. */
export type DescendantIn<V extends Value> = DescendantOf<V[number]>;

export type DescendantOf<N extends TNode> = N extends Editor
  ? ElementOf<N> | TextOf<N>
  : N extends TElement
    ? ElementOf<N['children'][number]> | TextOf<N>
    : never;

/**
 * The `Node` union type represents all of the different types of nodes that
 * occur in a Slate document tree.
 */
export type Node = TNode;

export interface NodeAncestorsOptions {
  reverse?: boolean;
}

export interface NodeChildrenOptions {
  /** Get children starting from this index (inclusive) */
  from?: number;
  reverse?: boolean;
  /** Get children up to this index (exclusive) */
  to?: number;
}

export interface NodeDescendantsOptions<N extends TNode> {
  from?: Path;
  reverse?: boolean;
  to?: Path;
  pass?: (entry: NodeEntry<DescendantOf<N>>) => boolean;
}

export interface NodeElementsOptions<N extends TNode> {
  from?: Path;
  reverse?: boolean;
  to?: Path;
  pass?: (entry: NodeEntry<ElementOf<N>>) => boolean;
}

/** A utility type to get all possible node types from a Value type */
export type NodeIn<V extends Value> = NodeOf<Editor | V[number]>;

export interface NodeLevelsOptions {
  reverse?: boolean;
}

export interface NodeNodesOptions<N extends TNode> {
  from?: Path;
  reverse?: boolean;
  to?: Path;
  pass?: (entry: NodeEntry<NodeOf<N>>) => boolean;
}

/** A utility type to get all the node types from a root node type. */
export type NodeOf<N extends TNode> = ElementOf<N> | N | TextOf<N>;

export interface NodeTextsOptions<N extends TNode> {
  from?: Path;
  reverse?: boolean;
  to?: Path;
  pass?: (entry: NodeEntry<TextOf<N>>) => boolean;
}

/** A helper type for narrowing matched nodes with a predicate. */
export type TNodeMatch<N extends TNode = TNode> =
  | ((node: N, path: Path) => boolean)
  | ((node: N, path: Path) => node is N);
