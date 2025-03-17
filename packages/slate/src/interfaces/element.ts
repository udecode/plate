import type { UnknownObject } from '@udecode/utils';

import { Element as SlateElement } from 'slate';

import type { Editor, Value } from './editor';
import type { Ancestor, Descendant, TNode } from './node';
import type { TextIn, TextOf } from './text';

/**
 * `TElement` objects are a type of node in a Slate document that contain other
 * element nodes or text nodes. They can be either "blocks" or "inlines"
 * depending on the Slate editor's configuration.
 */
export type TElement = {
  children: Descendant[];
  type: string;
} & UnknownObject;

/** Element retrieval and check methods. */
export const ElementApi: {
  /** Check if a value implements the 'Ancestor' interface. */
  isAncestor: <T extends Ancestor>(value: any) => value is T;
  /** Check if a value implements the `TElement` interface. */
  isElement: <T extends TElement>(value: any) => value is T;
  /** Check if a value is an array of `TElement` objects. */
  isElementList: <T extends TElement>(value: any) => value is T[];
  /** Check if a set of props is a partial of TElement. */
  isElementProps: <T extends TElement>(props: any) => props is Partial<T>;
  /**
   * Check if a value implements the `TElement` interface and has elementKey
   * with selected value. Default it check to `type` key value
   */
  isElementType: <T extends TElement>(
    value: any,
    elementVal: string,
    elementKey?: string
  ) => value is T;
  /**
   * Check if an element matches set of properties.
   *
   * Note: this checks custom properties, and it does not ensure that any
   * children are equivalent.
   */
  matches: (element: TElement, props: Partial<TElement>) => boolean;
} = {
  ...(SlateElement as any),
};

/**
 * `Element` objects are a type of node in a Slate document that contain other
 * element nodes or text nodes. They can be either "blocks" or "inlines"
 * depending on the Slate editor's configuration.
 */
export type Element = TElement;

/** A utility type to get all the element nodes type from a root node. */
export type ElementIn<V extends Value> = ElementOf<V[number]>;

export type ElementOf<N extends TNode> = Editor extends N
  ? TElement
  : TElement extends N
    ? TElement
    : N extends Editor
      ?
          | ElementOf<N['children'][number]>
          | Extract<N['children'][number], TElement>
      : N extends TElement
        ?
            | ElementOf<N['children'][number]>
            | Extract<N['children'][number], TElement>
            | N
        : never;

/**
 * `ElementEntry` objects refer to an `Element` and the `Path` where it can be
 * found inside a root node.
 */
// export type ElementEntry = [TElement, Path];

/** Element or text of an editor. */
export type ElementOrTextIn<V extends Value> = ElementIn<V> | TextIn<V>;

export type ElementOrTextOf<E extends Editor> = ElementOf<E> | TextOf<E>;
