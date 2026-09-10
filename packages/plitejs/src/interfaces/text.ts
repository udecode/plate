import { isObject } from '../utils/is-object';
import type { BaseEditor, EditorNodeTypeProvider } from './editor';
import type { Element } from './element';
import type { SchemaTextInNode } from './schema';

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type UnionToIntersection<U> = (
  U extends unknown ? (value: U) => void : never
) extends (value: infer I) => void
  ? I
  : never;

/**
 * `Text` objects represent the nodes that contain the actual text content of a
 * Plite document along with any formatting properties. They are always leaf
 * nodes in the document tree as they cannot contain any children.
 */

export interface BaseText {
  readonly text: string;
  readonly [key: string]: unknown;
}

export type Text = BaseText;

export type TextIn<V extends readonly unknown[]> = TextOf<V[number]>;

type TextOfVariant<N> = N extends Text
  ? N
  : Text extends N
    ? Text
    : N extends EditorNodeTypeProvider<any, infer TTextFactory>
      ? Extract<ReturnType<TTextFactory>, Text>
      : N extends BaseEditor<infer V, any>
        ? TextIn<V>
        : Element extends N
          ? Text
          : N extends { getChildren: () => infer V }
            ? V extends ReadonlyArray<infer Child>
              ? TextOf<Child>
              : never
            : [SchemaTextInNode<N>] extends [never]
              ? N extends Element
                ?
                    | Extract<N['children'][number], Text>
                    | TextOf<N['children'][number]>
                : never
              : SchemaTextInNode<N>;

export type TextOf<N> = N extends unknown ? TextOfVariant<N> : never;

type TextProps<T> = T extends Text ? Omit<T, 'text'> : never;

export type MarksOf<N> = Simplify<UnionToIntersection<TextProps<TextOf<N>>>>;

export type MarksIn<V extends readonly unknown[]> = MarksOf<V[number]>;

export type MarkKeysOf<N> = {} extends MarksOf<N> ? unknown : keyof MarksOf<N>;

type BooleanKeys<T> = {
  [K in keyof T]-?: Exclude<T[K], undefined> extends boolean ? K : never;
}[keyof T];

export type BooleanMarkKeysOf<N> = Extract<BooleanKeys<MarksOf<N>>, string>;

export type BooleanMarksOf<N> = Partial<
  Pick<MarksOf<N>, BooleanMarkKeysOf<N> & keyof MarksOf<N>>
>;

export type LeafPosition = Readonly<{
  end: number;
  isFirst?: true;
  isLast?: true;
  start: number;
}>;

export interface TextEqualsOptions {
  loose?: boolean;
}

export interface TextInterface {
  /**
   * Check if two text nodes are equal.
   *
   * When loose is set, the text is not compared. This is
   * used to check whether sibling text nodes can be merged.
   */
  equals: (text: Text, another: Text, options?: TextEqualsOptions) => boolean;

  /**
   * Check if a value implements the `Text` interface.
   */
  isText: <N extends Text = Text>(value: unknown) => value is N;

  /**
   * Check if a value is a list of `Text` objects.
   */
  isTextList: <N extends Text = Text>(value: unknown) => value is readonly N[];

  /**
   * Check if some props are a partial of Text.
   */
  isTextProps: <N extends Text = Text>(props: unknown) => props is Partial<N>;

  /**
   * Check if an text matches set of properties.
   *
   * Note: this is for matching custom properties, and it does not ensure that
   * the `text` property are two nodes equal.
   */
  matches: <N extends Text = Text>(text: N, props: Partial<N>) => boolean;
}

const getOwnValue = (object: Record<PropertyKey, unknown>, key: string) =>
  Object.hasOwn(object, key) ? object[key] : undefined;

const isTextValueEqual = (value: unknown, other: unknown): boolean => {
  if (value === other) return true;

  if (Array.isArray(value)) {
    if (!Array.isArray(other) || value.length !== other.length) return false;

    for (let index = 0; index < value.length; index++) {
      if (!isTextValueEqual(value[index], other[index])) return false;
    }

    return true;
  }

  if (!isObject(value) || !isObject(other) || Array.isArray(other)) {
    return false;
  }

  for (const key in value) {
    if (!Object.hasOwn(value, key)) continue;

    const item = value[key];
    const another = getOwnValue(other, key);

    if (item === another) continue;
    if (!isTextValueEqual(item, another)) return false;
  }

  for (const key in other) {
    if (!Object.hasOwn(other, key)) continue;
    if (getOwnValue(value, key) === undefined && other[key] !== undefined) {
      return false;
    }
  }

  return true;
};

export const TextApi: Readonly<TextInterface> = Object.freeze({
  equals(text: Text, another: Text, options: TextEqualsOptions = {}): boolean {
    const { loose = false } = options;

    function omitText(obj: Text) {
      const { text: innerText, ...rest } = obj;

      return rest;
    }

    return isTextValueEqual(
      loose ? omitText(text) : text,
      loose ? omitText(another) : another
    );
  },

  isText<N extends Text = Text>(value: unknown): value is N {
    return isObject(value) && typeof value.text === 'string';
  },

  isTextList<N extends Text = Text>(value: unknown): value is readonly N[] {
    return Array.isArray(value) && value.every((val) => TextApi.isText(val));
  },

  isTextProps<N extends Text = Text>(props: unknown): props is Partial<N> {
    return isObject(props) && Object.hasOwn(props, 'text');
  },

  matches<N extends Text = Text>(text: N, props: Partial<N>): boolean {
    for (const key in props) {
      if (key === 'text') {
        continue;
      }

      if (
        !Object.hasOwn(text, key) ||
        text[key as keyof Text] !== props[key as keyof Text]
      ) {
        return false;
      }
    }

    return true;
  },
});
