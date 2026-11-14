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
  type EditorStateNodesApi,
  type EditorStateSchemaApi,
  type EditorUpdateContext,
  type EditorUpdateTransaction,
  type Element,
  ElementApi,
  locateAt,
  type Node,
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
import { boardFramesIn, boardLayerOf, placeAmong } from './boardFrame.internal';
import type { BoardMemberEntry, BoardMembers } from './boardMember.internal';

/** A point on a board, in board coordinates. */
export type BoardPlace = Readonly<{ x: number; y: number }>;

/** A shape's size on its board. */
export type BoardSize = Readonly<{ height: number; width: number }>;

/** Where `restack` moves shapes in paint order. */
export type BoardRestackDirection = 'back' | 'backward' | 'forward' | 'front';

export const BOARD_SHAPES_SLOT = 'shapes';

export const BOARD_NOTE_SIZE: BoardSize = { height: 200, width: 200 };

export const BOARD_GEO_SIZE: BoardSize = { height: 100, width: 160 };

/**
 * How a selection of board members selects them. Plite takes an object
 * selection only of one object that is not void, so a frame, a void, takes a
 * block selection.
 */
export const shapeSelectionMode = (
  rules: Pick<EditorStateSchemaApi, 'isObject' | 'isVoid'>,
  nodes: readonly Node[]
) =>
  nodes.length === 1 && rules.isObject(nodes[0]) && !rules.isVoid(nodes[0])
    ? ('object' as const)
    : ('block' as const);

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

/** The content root that holds the members of the board block `board`. */
export const boardShapesRootOf = (
  reader: Readonly<{
    nodes: Pick<EditorStateNodesApi, 'get'>;
    schema: Pick<EditorStateSchemaApi, 'getElementContentRoots'>;
  }>,
  board: NodeKey
) => {
  const owner = reader.nodes.get(board)?.[0];

  return owner && ElementApi.isElement(owner)
    ? reader.schema.getElementContentRoots(owner)[BOARD_SHAPES_SLOT]
    : undefined;
};

/** The members of the board block `board`, in stored order. */
export const boardShapesOf = (
  reader: Parameters<typeof boardShapesRootOf>[0],
  members: Pick<BoardMembers, 'membersIn'>,
  board: NodeKey
): BoardMemberEntry[] => {
  const root = boardShapesRootOf(reader, board);

  return root ? members.membersIn(root) : [];
};

/** Add `node` after the last member of the board root `root`. */
export const appendBoardMember = (
  tx: Pick<EditorUpdateTransaction, 'nodes' | 'root'>,
  root: string,
  node: Element
) => {
  tx.nodes.replaceChildren([node], {
    at: [],
    count: 0,
    index: tx.root(root).length,
    root,
  });
};

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

/** The highest stacking key among the `members` that paint in `layer`. */
export const topKeyInLayer = (members: readonly Descendant[], layer: 0 | 1) => {
  let top: string | null = null;

  for (const member of members) {
    const { zIndex } = member;

    if (
      ElementApi.isElement(member) &&
      boardLayerOf(member.type) === layer &&
      typeof zIndex === 'string' &&
      (top === null || zIndex > top)
    ) {
      top = zIndex;
    }
  }

  return top;
};

/** A stacking key above every member of `members` that paints in `layer`. */
export const stackingKeyAboveLayer = (
  members: readonly Descendant[],
  layer: 0 | 1
) =>
  distinctPeerKey(
    generateKeyBetween(topKeyInLayer(members, layer), null),
    null
  );

/**
 * New stacking keys for the `moving` members of one paint layer `group`,
 * sorted in paint order, that move them `direction` and keep their order
 * among themselves. Empty when they cannot move that way.
 */
export const restackKeys = <T extends Readonly<{ id: string; zIndex: string }>>(
  group: readonly T[],
  moving: ReadonlySet<string>,
  direction: BoardRestackDirection
): Array<readonly [T, string]> => {
  const stacked = group.filter(({ id }) => moving.has(id));
  const others = group.filter(({ id }) => !moving.has(id));
  const lowest = others[0];
  const highest = others.at(-1);

  if (stacked.length === 0 || !lowest || !highest) return [];

  let bounds: readonly [string | null, string | null] | null = null;

  if (direction === 'front') {
    bounds = [highest.zIndex, null];
  } else if (direction === 'back') {
    bounds = [null, lowest.zIndex];
  } else if (direction === 'forward') {
    const top = group.findLastIndex(({ id }) => moving.has(id));
    const next = group.slice(top + 1).find(({ id }) => !moving.has(id));

    if (next) {
      bounds = [
        next.zIndex,
        others.find(({ zIndex }) => zIndex > next.zIndex)?.zIndex ?? null,
      ];
    }
  } else {
    const bottom = group.findIndex(({ id }) => moving.has(id));
    const previous = group
      .slice(0, bottom)
      .findLast(({ id }) => !moving.has(id));

    if (previous) {
      bounds = [
        others.findLast(({ zIndex }) => zIndex < previous.zIndex)?.zIndex ??
          null,
        previous.zIndex,
      ];
    }
  }
  if (!bounds) return [];

  const keys = stackingKeysBetween(...bounds, stacked.length);

  return stacked.map((member, index) => [member, keys[index]] as const);
};

export type BoardShapeInsertProps<TOwn> = Readonly<{
  children?: readonly Descendant[];
  /**
   * The id of a frame to join when the shape overlaps it, in place of the
   * frontmost frame under the shape's middle.
   */
  frame?: string;
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
            frame,
            height = size.height,
            width = size.width,
            x,
            y,
            ...own
          }: BoardShapeInsertProps<Readonly<Record<string, unknown>>>,
          { board }: Readonly<{ board: NodeKey }>
        ) => {
          const root = boardShapesRootOf(tx, board);

          if (!root) return undefined;

          const shapes = tx.root(root);
          const place = placeAmong(
            boardFramesIn(shapes).values(),
            { place: { x, y }, size: { height, width } },
            { requested: frame }
          );

          if (![place.x, place.y, height, width].every(Number.isFinite)) {
            return undefined;
          }

          const shapeId = nanoid();
          const shape = tx.schema.create(type, {
            ...own,
            place,
            shapeId,
            size: { height, width },
            zIndex: stackingKeyAboveLayer(shapes, boardLayerOf(type)),
          });

          appendBoardMember(
            tx,
            root,
            children ? { ...shape, children: [...children] } : shape
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
  { properties, size }: Readonly<{ properties: TProperties; size: BoardSize }>
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
        properties,
      },
    }),
    targetPlugins: [BaseParagraphPlugin, PLUGINS.heading],
  }).extend(
    boardShapeStage<{
      [K in keyof TProperties]: PropertyValueOf<TProperties[K]>;
    }>(size)
  );
