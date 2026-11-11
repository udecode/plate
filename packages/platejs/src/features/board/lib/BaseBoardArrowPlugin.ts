import { nanoid } from 'nanoid';

import {
  BaseParagraphPlugin,
  definePlugin,
  type Descendant,
  ElementApi,
  type ElementOf,
  locateAt,
  type NodeKey,
  PLUGINS,
  property,
  schema,
  txLocate,
} from '../../../core';
import {
  BOARD_ARROW_TYPE,
  type BoardArrowAnchor,
  type BoardArrowEnd,
  type BoardArrowSide,
  boardTargetsOn,
  isBoardArrowEnd,
  isBoundArrowEnd,
  resolveBoardArrow,
} from './boardArrow.internal';
import {
  BOARD_SHAPES_SLOT,
  type BoardPlace,
  stackingKeyAbove,
} from './boardShape.internal';

export type {
  BoardArrowAnchor,
  BoardArrowEnd,
  BoardArrowEnds,
  BoardArrowSide,
} from './boardArrow.internal';

/**
 * An arrow end as a command takes it: a shape id, bound at the shape's
 * center; a shape with the anchor to aim at, as fractions of its box; or a
 * free board point.
 */
export type BoardArrowEndInput =
  | BoardPlace
  | string
  | Readonly<{ anchor?: BoardArrowAnchor; shape: string }>;

/**
 * An arrow on a board, holding a text label. Each end is stored on the arrow,
 * bound to a shape of the same board or free at a board point.
 */
export const BaseBoardArrowPlugin = definePlugin(BOARD_ARROW_TYPE, {
  schema: ({ targetElementTypes }) => ({
    element: {
      blockContent: false,
      content: schema.content.types(targetElementTypes, {
        default: { type: targetElementTypes[0] },
        min: 1,
      }),
      object: true,
      properties: {
        end: property.json({
          required: true,
          validate: isBoardArrowEnd,
          validationVersion: 1,
        }),
        start: property.json({
          required: true,
          validate: isBoardArrowEnd,
          validationVersion: 1,
        }),
      },
    },
  }),
  formats: ({ defineFormats }) =>
    defineFormats({
      markdown: {
        encode: ({ encodeFlow, node }) => encodeFlow(node.children),
      },
    }),
  targetPlugins: [BaseParagraphPlugin, PLUGINS.heading],
}).extend(({ schema: { type } }) => ({
  update: ({ tx }) => {
    const storedOf = (input: BoardArrowEndInput): BoardArrowEnd =>
      typeof input === 'string'
        ? { anchor: [0.5, 0.5], shape: input, x: 0, y: 0 }
        : 'shape' in input
          ? {
              anchor: input.anchor ?? [0.5, 0.5],
              shape: input.shape,
              x: 0,
              y: 0,
            }
          : { x: input.x, y: input.y };
    const endsToWrite = (
      ends: Readonly<Record<BoardArrowSide, BoardArrowEnd>>,
      root: string,
      sides: readonly BoardArrowSide[]
    ) => {
      const targetOnBoard = boardTargetsOn(tx, root);
      const drawn = resolveBoardArrow(ends, targetOnBoard);
      const written: Partial<Record<BoardArrowSide, BoardArrowEnd>> = {};

      for (const side of sides) {
        const end = ends[side];
        const point = isBoundArrowEnd(end) ? { ...end, ...drawn[side] } : end;

        if (
          !isBoardArrowEnd(point) ||
          (isBoundArrowEnd(end) && !targetOnBoard(end.shape))
        ) {
          return null;
        }
        written[side] = point;
      }

      return written;
    };

    return {
      /**
       * Add an arrow above every shape of its board and return its id. The
       * arrow joins the board its bound ends name; `board` names it when both
       * ends are free. Each bound end saves the point it draws at. Return
       * undefined when an end names a missing shape, an arrow or a shape of
       * another board.
       */
      insert: txLocate(
        locateAt(1, 'board'),
        (
          {
            children,
            end,
            start,
          }: Readonly<{
            children?: readonly Descendant[];
            end: BoardArrowEndInput;
            start: BoardArrowEndInput;
          }>,
          { board }: Readonly<{ board?: NodeKey }> = {}
        ): string | undefined => {
          const ends = { end: storedOf(end), start: storedOf(start) };
          const owner =
            board === undefined ? undefined : tx.nodes.get(board)?.[0];
          const named =
            owner && ElementApi.isElement(owner)
              ? tx.schema.getElementContentRoots(owner)[BOARD_SHAPES_SLOT]
              : undefined;
          const bound = [ends.start, ends.end].find(isBoundArrowEnd);
          const root =
            named ?? (bound && tx.unique.holder('shapeId', bound.shape)?.root);
          const written = root
            ? endsToWrite(ends, root, ['start', 'end'])
            : null;

          if (!root || !written || (board !== undefined && !named)) {
            return undefined;
          }

          const shapes = tx.root(root);
          const shapeId = nanoid();
          const arrow = tx.schema.create(type, {
            ...written,
            shapeId,
            zIndex: stackingKeyAbove(shapes),
          });

          tx.nodes.replaceChildren(
            [children ? { ...arrow, children: [...children] } : arrow],
            { at: [], count: 0, index: shapes.length, root }
          );

          return shapeId;
        }
      ),
      /**
       * Set one end of arrow `id`. A bound end saves the point it draws at.
       * Return false, writing nothing, when `id` names no arrow or the end
       * names a missing shape, an arrow or a shape of another board.
       */
      setEnd: txLocate(
        false,
        (id: string, side: BoardArrowSide, input: BoardArrowEndInput) => {
          const holder = tx.unique.holder('shapeId', id);
          const arrow = holder && tx.nodes.get(holder.key)?.[0];

          if (
            !holder ||
            !arrow ||
            !ElementApi.isElement(arrow) ||
            arrow.type !== type ||
            !isBoardArrowEnd(arrow.start) ||
            !isBoardArrowEnd(arrow.end)
          ) {
            return false;
          }

          const written = endsToWrite(
            { end: arrow.end, start: arrow.start, [side]: storedOf(input) },
            holder.root,
            [side]
          );

          if (!written) return false;
          tx.nodes.set(written, { at: holder.key });

          return true;
        }
      ),
    };
  },
}));

export type BoardArrowElement = ElementOf<typeof BaseBoardArrowPlugin>;
