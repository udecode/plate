import { type Range, RangeApi } from '..';
import { isDeepEqual } from '../utils/deep-equal';
import { isObject } from '../utils/is-object';
import type { BaseEditor } from './editor';
import type { Element } from './element';

type Simplify<T> = { [K in keyof T]: T[K] } & {};

type UnionToIntersection<U> = (
  U extends unknown
    ? (value: U) => void
    : never
) extends (value: infer I) => void
  ? I
  : never;

/**
 * `Text` objects represent the nodes that contain the actual text content of a
 * Slate document along with any formatting properties. They are always leaf
 * nodes in the document tree as they cannot contain any children.
 */

export interface BaseText {
  text: string;
  [key: string]: unknown;
}

export type Text = BaseText;

export type TextIn<V extends readonly unknown[]> = TextOf<V[number]>;

export type TextOf<N> = N extends Text
  ? N
  : Text extends N
    ? Text
    : N extends BaseEditor<infer V>
      ? TextIn<V>
      : Element extends N
        ? Text
        : N extends { getChildren: () => infer V }
          ? V extends readonly (infer Child)[]
            ? TextOf<Child>
            : never
          : N extends Element
            ?
                | Extract<N['children'][number], Text>
                | TextOf<N['children'][number]>
            : never;

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

export interface LeafPosition {
  start: number;
  end: number;
  isFirst?: true;
  isLast?: true;
}

export interface TextEqualsOptions {
  loose?: boolean;
}

export type DecoratedRange = Range & {
  /**
   * Customize how another decoration is merged into a text node. If not specified, `Object.assign` would be used.
   * It is useful for overlapping decorations with the same key but different values.
   */
  merge?: (leaf: Text, decoration: object) => void;
};

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
  isTextList: <N extends Text = Text>(value: unknown) => value is N[];

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

  /**
   * Get the leaves for a text node given decorations.
   */
  decorations: (
    node: Text,
    decorations: DecoratedRange[]
  ) => { leaf: Text; position?: LeafPosition }[];
}

// eslint-disable-next-line no-redeclare
export const TextApi: TextInterface = {
  equals(text: Text, another: Text, options: TextEqualsOptions = {}): boolean {
    const { loose = false } = options;

    function omitText(obj: Record<any, any>) {
      const { text, ...rest } = obj;

      return rest;
    }

    return isDeepEqual(
      loose ? omitText(text) : text,
      loose ? omitText(another) : another
    );
  },

  isText<N extends Text = Text>(value: unknown): value is N {
    return isObject(value) && typeof value.text === 'string';
  },

  isTextList<N extends Text = Text>(value: unknown): value is N[] {
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
        text[<keyof Text>key] !== props[<keyof Text>key]
      ) {
        return false;
      }
    }

    return true;
  },

  decorations(
    node: Text,
    decorations: DecoratedRange[]
  ): { leaf: Text; position?: LeafPosition }[] {
    let leaves: { leaf: Text; position?: LeafPosition }[] = [
      { leaf: { ...node } },
    ];

    for (const dec of decorations) {
      const { anchor, focus, merge: mergeDecoration, ...rest } = dec;
      const [start, end] = RangeApi.edges(dec);
      const next: Array<{ leaf: Text; position?: LeafPosition }> = [];
      let leafEnd = 0;
      const decorationStart = start.offset;
      const decorationEnd = end.offset;
      const merge = mergeDecoration ?? Object.assign;

      for (const { leaf } of leaves) {
        const { length } = leaf.text;
        const leafStart = leafEnd;
        leafEnd += length;

        // If the range encompasses the entire leaf, add the range.
        if (decorationStart <= leafStart && leafEnd <= decorationEnd) {
          merge(leaf, rest);
          next.push({ leaf });
          continue;
        }

        // If the range expanded and match the leaf, or starts after, or ends before it, continue.
        if (
          (decorationStart !== decorationEnd &&
            (decorationStart === leafEnd || decorationEnd === leafStart)) ||
          decorationStart > leafEnd ||
          decorationEnd < leafStart ||
          (decorationEnd === leafStart && leafStart !== 0)
        ) {
          next.push({ leaf });
          continue;
        }

        // Otherwise we need to split the leaf, at the start, end, or both,
        // and add the range to the middle intersecting section. Do the end
        // split first since we don't need to update the offset that way.
        let middle = leaf;
        let before: { leaf: Text } | undefined;
        let after: { leaf: Text } | undefined;

        if (decorationEnd < leafEnd) {
          const off = decorationEnd - leafStart;
          after = { leaf: { ...middle, text: middle.text.slice(off) } };
          middle = { ...middle, text: middle.text.slice(0, off) };
        }

        if (decorationStart > leafStart) {
          const off = decorationStart - leafStart;
          before = { leaf: { ...middle, text: middle.text.slice(0, off) } };
          middle = { ...middle, text: middle.text.slice(off) };
        }

        merge(middle, rest);

        if (before) {
          next.push(before);
        }

        next.push({ leaf: middle });

        if (after) {
          next.push(after);
        }
      }

      leaves = next;
    }

    if (leaves.length > 1) {
      let currentOffset = 0;
      for (const [index, item] of leaves.entries()) {
        const start = currentOffset;
        const end = start + item.leaf.text.length;
        const position: LeafPosition = { start, end };

        if (index === 0) position.isFirst = true;
        if (index === leaves.length - 1) position.isLast = true;

        item.position = position;
        currentOffset = end;
      }
    }

    return leaves;
  },
};
