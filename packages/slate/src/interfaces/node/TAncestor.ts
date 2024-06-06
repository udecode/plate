import type { TEditor, Value } from '../editor/TEditor';
import type { ElementOf, TElement } from '../element/TElement';
import type { TNode } from './TNode';

/**
 * The `Ancestor` union type represents nodes that are ancestors in the tree. It
 * is returned as a convenience in certain cases to narrow a value further than
 * the more generic `Node` union.
 */
export type TAncestor = TEditor | TElement;

/** Ancestor of an editor. */
export type EAncestor<V extends Value> = AncestorOf<TEditor<V>>;

/** A utility type to get all the ancestor node types from a root node type. */
export type AncestorOf<N extends TNode> = TEditor extends N
  ? TEditor | TElement
  : TElement extends N
    ? TElement
    : N extends TEditor
      ? ElementOf<N['children'][number]> | N | N['children'][number]
      : N extends TElement
        ? ElementOf<N> | N
        : never;
