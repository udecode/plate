import {
  BASE_62_DIGITS,
  generateKeyBetween,
  generateNKeysBetween,
} from 'fractional-indexing';
import { nanoid } from 'nanoid';

import {
  BaseParagraphPlugin,
  type BasePluginContext,
  type BasePluginDefinition,
  definePlugin,
  type Descendant,
  type EditorUpdateContext,
  ElementApi,
  locateAt,
  type NodeKey,
  PLUGINS,
  type PluginTransaction,
  type PropertyValueOf,
  schema,
  type SchemaElement,
  type SchemaElementProperties,
  txLocate,
} from '../../../core';
import type { TxDeclaredMethod } from '../../../facade';

/** A shape's place on its board, in board coordinates. */
export type BoardPlace = Readonly<{ x: number; y: number }>;

/** A shape's size on its board. */
export type BoardSize = Readonly<{ height: number; width: number }>;

export const BOARD_SHAPES_SLOT = 'shapes';

export const shapeSelectionMode = (count: number) =>
  count === 1 ? ('object' as const) : ('block' as const);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const hasOnlyKeys = (value: object, keys: readonly string[]) =>
  Object.keys(value).every((key) => keys.includes(key));

export const isBoardPlace = (value: unknown): value is BoardPlace =>
  typeof value === 'object' &&
  value !== null &&
  hasOnlyKeys(value, ['x', 'y']) &&
  isFiniteNumber((value as BoardPlace).x) &&
  isFiniteNumber((value as BoardPlace).y);

export const isBoardSize = (value: unknown): value is BoardSize =>
  typeof value === 'object' &&
  value !== null &&
  hasOnlyKeys(value, ['height', 'width']) &&
  isFiniteNumber((value as BoardSize).height) &&
  isFiniteNumber((value as BoardSize).width) &&
  (value as BoardSize).height > 0 &&
  (value as BoardSize).width > 0;

const BASE_62 = /^[\dA-Za-z]+$/;
const SMALLEST_KEY = `A${'0'.repeat(26)}`;

const integerLength = (head: string) => {
  if (head >= 'a' && head <= 'z') return head.charCodeAt(0) - 95;
  if (head >= 'A' && head <= 'Z') return 92 - head.charCodeAt(0);

  return 0;
};

/**
 * Whether `value` is a fractional-indexing key: a head letter, the integer
 * digits its head counts, then fraction digits that do not end in `0`, all
 * base 62. `fractional-indexing` itself skips the digit check.
 */
export const isStackingKey = (value: unknown): value is string => {
  if (typeof value !== 'string' || !BASE_62.test(value)) return false;

  const length = integerLength(value[0]);

  return (
    length > 0 &&
    value.length >= length &&
    !value.slice(length).endsWith('0') &&
    value !== SMALLEST_KEY
  );
};

const randomDigit = (from: number, to: number) =>
  BASE_62_DIGITS[from + Math.floor(Math.random() * (to - from))];

const prefixBelowExtension = (key: string, upper: string) => {
  const rest = upper.slice(key.length);
  const zeros = rest.length - rest.replace(/^0+/, '').length;

  return `${key}${rest.slice(0, zeros)}${randomDigit(
    0,
    BASE_62_DIGITS.indexOf(rest[zeros])
  )}`;
};

const distinctPeerKey = (key: string, upper: string | null) => {
  const tail = `${randomDigit(0, 62)}${randomDigit(0, 62)}${randomDigit(
    1,
    62
  )}`;

  return upper?.startsWith(key)
    ? prefixBelowExtension(key, upper) + tail
    : key + tail;
};

export const stackingKeysBetween = (
  lower: string | null,
  upper: string | null,
  count: number
) => {
  const keys = generateNKeysBetween(lower, upper, count);

  return keys.map((key, index) =>
    distinctPeerKey(key, keys[index + 1] ?? upper)
  );
};

export const stackingKeyBetween = (
  lower: string | null,
  upper: string | null
) => distinctPeerKey(generateKeyBetween(lower, upper), upper);

export const stackingKeyAbove = (members: readonly Descendant[]) => {
  let top: string | null = null;

  for (const { zIndex } of members) {
    if (typeof zIndex === 'string' && (top === null || zIndex > top)) {
      top = zIndex;
    }
  }

  return stackingKeyBetween(top, null);
};

export type BoardShapeInsertProps<TOwn> = Readonly<{
  children?: readonly Descendant[];
  height?: number;
  width?: number;
  x: number;
  y: number;
}> &
  Partial<TOwn>;

type BoardShapeDefinition = BasePluginDefinition &
  Readonly<{ schema: Readonly<{ element: SchemaElement }> }>;

type BoardShapeUpdate<TOwn> = {
  insert: TxDeclaredMethod<
    (
      props: BoardShapeInsertProps<TOwn>,
      options: Readonly<{ board: NodeKey }>
    ) => string | undefined
  >;
};

type BoardShapeStage<C extends BoardShapeDefinition, TOwn> = (
  context: BasePluginContext<C>
) => {
  update: (
    context: BasePluginContext<C> & {
      context: EditorUpdateContext;
      tx: PluginTransaction<C>;
    }
  ) => BoardShapeUpdate<TOwn>;
};

function boardShapeStage<TOwn>(
  size: BoardSize
): <const C extends BoardShapeDefinition>(
  context: BasePluginContext<C>
) => ReturnType<BoardShapeStage<C, TOwn>>;
function boardShapeStage(size: BoardSize): unknown {
  const stage: BoardShapeStage<
    BoardShapeDefinition,
    Readonly<Record<string, unknown>>
  > = ({ schema: { type } }) => ({
    update: ({ tx }) => ({
      insert: txLocate(
        locateAt(1, 'board'),
        (
          {
            children,
            height = size.height,
            width = size.width,
            x,
            y,
            ...own
          }: BoardShapeInsertProps<Readonly<Record<string, unknown>>>,
          { board }: Readonly<{ board: NodeKey }>
        ) => {
          const owner = tx.nodes.get(board)?.[0];
          const root =
            owner && ElementApi.isElement(owner)
              ? tx.schema.getElementContentRoots(owner)[BOARD_SHAPES_SLOT]
              : undefined;

          if (!root) return undefined;

          const shapes = tx.root(root);
          const shapeId = nanoid();
          const shape = tx.schema.create(type, {
            ...own,
            place: { x, y },
            shapeId,
            size: { height, width },
            zIndex: stackingKeyAbove(shapes),
          });

          tx.nodes.replaceChildren(
            [children ? { ...shape, children: [...children] } : shape],
            { at: [], count: 0, index: shapes.length, root }
          );

          return shapeId;
        }
      ),
    }),
  });

  return stage;
}

export const defineBoardShape = <
  const TName extends string,
  const TProperties extends SchemaElementProperties = {},
>(
  name: TName,
  { properties, size }: Readonly<{ properties?: TProperties; size: BoardSize }>
) =>
  definePlugin(name, {
    schema: ({ targetElementTypes }) => ({
      element: {
        blockContent: false,
        content: schema.content.types(targetElementTypes, {
          default: { type: targetElementTypes[0] },
          min: 1,
        }),
        object: true,
        ...(properties ? { properties } : {}),
      },
    }),
    targetPlugins: [BaseParagraphPlugin, PLUGINS.heading],
  }).extend(
    boardShapeStage<{
      [K in keyof TProperties]: PropertyValueOf<TProperties[K]>;
    }>(size)
  );
