import { type Ancestor, type Descendant, NodeApi, type Path } from '..';
import { isObject } from '../utils/is-object';
import type { BaseEditor } from './editor';

/**
 * `Element` objects are a type of node in a Plite document that contain other
 * element nodes or text nodes. They can be either "blocks" or "inlines"
 * depending on the Plite editor's configuration.
 */

export interface BaseElement {
  children: Descendant[];
  type: string;
  [key: string]: unknown;
}

export type Element = BaseElement;

export type ElementIn<V extends readonly unknown[]> = ElementOf<V[number]>;

export type ElementOf<N> = Element extends N
  ? Element
  : N extends BaseEditor<infer V>
    ? ElementIn<V>
    : N extends { getChildren: () => infer V }
      ? V extends readonly (infer Child)[]
        ? Extract<Child, Element> | ElementOf<Child>
        : never
      : N extends Element
        ?
            | N
            | Extract<N['children'][number], Element>
            | ElementOf<N['children'][number]>
        : never;

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
  isAncestor: <T extends Ancestor = Ancestor>(
    value: unknown,
    options?: ElementIsElementOptions
  ) => value is T;

  /**
   * Check if a value implements the `Element` interface.
   */
  isElement: <T extends Element = Element>(
    value: unknown,
    options?: ElementIsElementOptions
  ) => value is T;

  /**
   * Check if a value is an array of `Element` objects.
   */
  isElementList: <T extends Element = Element>(
    value: unknown,
    options?: ElementIsElementOptions
  ) => value is T[];

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
  isElementType: <T extends Element>(
    value: unknown,
    elementVal: string,
    elementKey?: string
  ) => value is T;

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
    Array.isArray(value.children) &&
    Array.isArray(value.operations) &&
    'selection' in value &&
    'marks' in value
  ) {
    return false;
  }

  const isChildrenValid = deep
    ? NodeApi.isNodeList(value.children)
    : Array.isArray(value.children);

  return isChildrenValid;
};

// eslint-disable-next-line no-redeclare
export const ElementApi: ElementInterface = {
  isAncestor<T extends Ancestor = Ancestor>(
    value: unknown,
    { deep = false }: ElementIsElementOptions = {}
  ): value is T {
    return isObject(value) && NodeApi.isNodeList(value.children, { deep });
  },

  isElement: isElement as ElementInterface['isElement'],

  isElementList<T extends Element = Element>(
    value: unknown,
    { deep = false }: ElementIsElementOptions = {}
  ): value is T[] {
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

  isElementType: <T extends Element>(
    value: unknown,
    elementVal: string,
    elementKey = 'type'
  ): value is T =>
    isElement(value) &&
    (value as unknown as Record<string, unknown>)[elementKey] === elementVal,

  matches<T extends Element = Element>(element: T, props: Partial<T>): boolean {
    for (const key in props) {
      if (key === 'children') {
        continue;
      }

      if (element[<keyof Descendant>key] !== props[<keyof Descendant>key]) {
        return false;
      }
    }

    return true;
  },
};

/**
 * `ElementEntry` objects refer to an `Element` and the `Path` where it can be
 * found inside a root node.
 */
export type ElementEntry<N = Element> = [ElementOf<N>, Path];
