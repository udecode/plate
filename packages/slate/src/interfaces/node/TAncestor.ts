import type { Editor, Value } from '../editor/editor';
import type { ElementOf, TElement } from '../element/TElement';
import type { TNode } from './TNode';

/**
 * The `Ancestor` union type represents nodes that are ancestors in the tree. It
 * is returned as a convenience in certain cases to narrow a value further than
 * the more generic `Node` union.
 */
export type TAncestor = Editor | TElement;

/** A utility type to get all the ancestor node types from a root node type. */
export type AncestorOf<N extends TNode> = Editor extends N
  ? Editor | TElement
  : TElement extends N
    ? TElement
    : N extends Editor
      ? ElementOf<N['children'][number]> | N | N['children'][number]
      : N extends TElement
        ? ElementOf<N> | N
        : never;

export type AncestorIn<V extends Value> = AncestorOf<Editor | V[number]>;
