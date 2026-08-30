import { type Ancestor, type Descendant, NodeApi, type Path } from '..';
import { isObject } from '../utils/is-object';
import type { BaseEditor, EditorNodeTypeProvider } from './editor';
import type {
  EditorSchemaExtensionProvider,
  SchemaElementInNode,
  SchemaElementShapeFor,
  SchemaElementTypes,
} from './schema';

/**
 * `Element` objects are a type of node in a Plite document that contain other
 * element nodes or text nodes. They can be either "blocks" or "inlines"
 * depending on the Plite editor's configuration.
 */

export interface BaseElement {
  readonly children: readonly Descendant[];
  readonly type: string;
  readonly [key: string]: unknown;
}

export type Element = BaseElement;

export type ElementIn<V extends readonly unknown[]> = ElementOf<V[number]>;

type ElementOfVariant<N> = Element extends N
  ? Element
  : N extends EditorNodeTypeProvider<infer TElementFactory, any>
    ? Extract<ReturnType<TElementFactory>, Element>
    : N extends BaseEditor<infer V, any>
      ? ElementIn<V>
      : N extends EditorSchemaExtensionProvider<infer TSchema>
        ? SchemaElementShapeFor<TSchema, SchemaElementTypes<TSchema>>
        : N extends { getChildren: () => infer V }
          ? V extends ReadonlyArray<infer Child>
            ? Extract<Child, Element> | ElementOf<Child>
            : never
          : [SchemaElementInNode<N>] extends [never]
            ? N extends Element
              ?
                  | N
                  | Extract<N['children'][number], Element>
                  | ElementOf<N['children'][number]>
              : never
            : SchemaElementInNode<N>;

export type ElementOf<N> = N extends unknown ? ElementOfVariant<N> : never;

export type ElementOrTextOf<E> = ElementOf<E> | import('./text').TextOf<E>;

export type ElementOrTextIn<V extends readonly unknown[]> =
  | ElementIn<V>
  | import('./text').TextIn<V>;

export interface ElementIsElementOptions {
  deep?: boolean;
}

export interface ElementInterface {
  /**
   * Check if a value implements the 'Ancestor' interface.
   */
  isAncestor: (
    value: unknown,
    options?: ElementIsElementOptions
  ) => value is Ancestor;

  /**
   * Check if a value implements the `Element` interface.
   */
  isElement: (
    value: unknown,
    options?: ElementIsElementOptions
  ) => value is Element;

  /**
   * Check if a value is an array of `Element` objects.
   */
  isElementList: (
    value: unknown,
    options?: ElementIsElementOptions
  ) => value is readonly Element[];

  /**
   * Check if a set of props is a partial of Element.
   */
  isElementProps: <T extends Element = Element>(
    props: unknown
  ) => props is Partial<T>;

  /**
   * Check if a value implements the `Element` interface and has elementKey with selected value.
   * Default it check to `type` key value
   */
  isElementType: (
    value: unknown,
    elementVal: string,
    elementKey?: string
  ) => value is Element;

  /**
   * Check if an element matches set of properties.
   *
   * Note: this checks custom properties, and it does not ensure that any
   * children are equivalent.
   */
  matches: <T extends Element = Element>(
    element: T,
    props: Partial<T>
  ) => boolean;
}

/**
 * Shared the function with isElementType utility
 */
const isElement = (
  value: unknown,
  { deep = false }: ElementIsElementOptions = {}
): value is Element => {
  if (!isObject(value)) return false;
  if (
    (typeof value.read === 'function' && typeof value.update === 'function') ||
    ('selection' in value && typeof value.insertText === 'function')
  ) {
    return false;
  }
  if (typeof value.type !== 'string') return false;

  const isChildrenValid = deep
    ? NodeApi.isNodeList(value.children)
    : Array.isArray(value.children);

  return isChildrenValid;
};

export const ElementApi: Readonly<ElementInterface> = Object.freeze({
  isAncestor(
    value: unknown,
    { deep = false }: ElementIsElementOptions = {}
  ): value is Ancestor {
    return isObject(value) && NodeApi.isNodeList(value.children, { deep });
  },

  isElement,

  isElementList(
    value: unknown,
    { deep = false }: ElementIsElementOptions = {}
  ): value is readonly Element[] {
    return (
      Array.isArray(value) &&
      value.every((val) => ElementApi.isElement(val, { deep }))
    );
  },

  isElementProps<T extends Element = Element>(
    props: unknown
  ): props is Partial<T> {
    return (props as Partial<Element>).children !== undefined;
  },

  isElementType: (
    value: unknown,
    elementVal: string,
    elementKey = 'type'
  ): value is Element =>
    isElement(value) &&
    (value as unknown as Record<string, unknown>)[elementKey] === elementVal,

  matches<T extends Element = Element>(element: T, props: Partial<T>): boolean {
    for (const key in props) {
      if (key === 'children') {
        continue;
      }

      if (element[key as keyof Descendant] !== props[key as keyof Descendant]) {
        return false;
      }
    }

    return true;
  },
});

/**
 * `ElementEntry` objects refer to an `Element` and the `Path` where it can be
 * found inside a root node.
 */
export type ElementEntry<N = Element> = readonly [ElementOf<N>, Path];
