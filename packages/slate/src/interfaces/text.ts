import type {
  Simplify,
  UnionToIntersection,
  UnknownObject,
} from '@udecode/utils';

import {
  type DecoratedRange as SlateDecoratedRange,
  Text as SlateText,
} from 'slate';

import type { Editor, Value } from './editor/editor-type';
import type { TElement } from './element';
import type { NodeProps, TNode } from './node';

/**
 * `TText` objects represent the nodes that contain the actual text content of a
 * Slate document along with any formatting properties. They are always leaf
 * nodes in the document tree as they cannot contain any children.
 */
export type TText = {
  text: string;
} & UnknownObject;

/** Text retrieval and check methods. */
export const TextApi: {
  /** Get the leaves for a text node given decorations. */
  decorations: <N extends TText>(
    node: TText,
    decorations: DecoratedRange[]
  ) => N[];
  /** Check if two text nodes are equal. */
  equals: (text: TText, another: TText, options?: TextEqualsOptions) => boolean;
  /** Check if a value implements the `Text` interface. */
  isText: <N extends TText>(value: any) => value is N;
  /** Check if a value is a list of `Text` objects. */
  isTextList: <N extends TText>(value: any) => value is N[];
  /** Check if some props are a partial of Text. */
  isTextProps: <N extends TText>(props: any) => props is Partial<N>;
  /**
   * Check if an text matches set of properties.
   *
   * Note: this is for matching custom properties, and it does not ensure that
   * the `text` property are two nodes equal.
   */
  matches: <N extends TText>(text: N, props: Partial<N>) => boolean;
} = SlateText as any;

/**
 * `Text` objects represent the nodes that contain the actual text content of a
 * Slate document along with any formatting properties. They are always leaf
 * nodes in the document tree as they cannot contain any children.
 */
export type DecoratedRange = SlateDecoratedRange;

/** A utility type to get all the mark types from a root node type. */
export type MarkKeysOf<N extends TNode> =
  {} extends MarksOf<N> ? unknown : keyof MarksOf<N>;

export type MarksIn<V extends Value> = MarksOf<V[number]>;

export type MarksOf<N extends TNode> = Simplify<
  UnionToIntersection<NodeProps<TextOf<N>>>
>;

export type Text = TText;

export interface TextEqualsOptions {
  /**
   * If true, the text is not compared. This is used to check whether sibling
   * text nodes can be merged.
   */
  loose?: boolean;
}

/** A utility type to get all the text node types from a root node type. */
export type TextIn<V extends Value> = TextOf<V[number]>;

export type TextOf<N extends TNode> = Editor extends N
  ? TText
  : TElement extends N
    ? TText
    : N extends Editor
      ? TextOf<N['children'][number]>
      : N extends TElement
        ? Extract<N['children'][number], TText> | TextOf<N['children'][number]>
        : N extends TText
          ? N
          : never;
