import { nanoid } from 'nanoid';

import {
  definePlugin,
  type ElementOf,
  locateAt,
  type NodeKey,
  property,
  txLocate,
} from '../../../core';
import { boardFramesIn, boardLayerOf, placeAmong } from './boardFrame.internal';
import {
  appendBoardMember,
  boardShapesRootOf,
  definedProps,
  stackingKeyAboveLayer,
} from './boardShape.internal';
import {
  BOARD_STROKE_REACH,
  BOARD_STROKE_TYPE,
  type BoardInkPoint,
  isBoardStrokePoints,
} from './boardStroke.internal';
import {
  BOARD_STROKE_STYLES,
  type BoardStyles,
  boardStyleProperties,
} from './boardStyle.internal';

const toFraction = (value: number, from: number, length: number) =>
  length > 0 ? Math.round(((value - from) / length) * 10_000) / 10_000 : 0.5;

/**
 * A pen line on a board: a void that stores its points as one value, measured
 * in its box, so a move writes only its place and a resize scales the line
 * while the box keeps its padding.
 */
export const BaseBoardStrokePlugin = definePlugin(BOARD_STROKE_TYPE, {
  schema: {
    element: {
      blockContent: false,
      properties: {
        points: property.json({
          required: true,
          validate: isBoardStrokePoints,
          validationVersion: 1,
        }),
        ...boardStyleProperties(BOARD_STROKE_STYLES),
      },
      void: 'block',
    },
  },
  update: ({ schema: { type }, tx }) => ({
    /**
     * Add a line drawn through `points` above every shape of the board block
     * `board`, with the styles given and the default of each other style, and
     * return its id. Its box holds the line at full pressure, and it joins the
     * frontmost frame under its middle. One point adds a dot.
     * Return undefined when `board` is no board, or when `points` is empty or
     * holds a number that is not finite.
     */
    insert: txLocate(
      locateAt(1, 'board'),
      (
        {
          points,
          ...styles
        }: Readonly<{ points: readonly BoardInkPoint[] }> &
          Partial<Pick<BoardStyles, keyof typeof BOARD_STROKE_STYLES>>,
        { board }: Readonly<{ board: NodeKey }>
      ) => {
        const root = boardShapesRootOf(tx, board);

        if (
          !root ||
          points.length === 0 ||
          !points.flat().every(Number.isFinite)
        ) {
          return undefined;
        }

        const xs = points.map(([x]) => x);
        const ys = points.map(([, y]) => y);
        const from = { x: Math.min(...xs), y: Math.min(...ys) };
        const extent = {
          height: Math.max(...ys) - from.y,
          width: Math.max(...xs) - from.x,
        };
        const reach = BOARD_STROKE_REACH;
        const place = { x: from.x - reach, y: from.y - reach };
        const size = {
          height: extent.height + 2 * reach,
          width: extent.width + 2 * reach,
        };
        const shapes = tx.root(root);
        const shapeId = nanoid();

        appendBoardMember(
          tx,
          root,
          tx.schema.create(type, {
            ...definedProps(styles),
            place: placeAmong(boardFramesIn(shapes).values(), { place, size }),
            points: points.flatMap(([x, y, pressure]) => [
              toFraction(x, from.x, extent.width),
              toFraction(y, from.y, extent.height),
              Math.round(Math.min(1, Math.max(0, pressure)) * 100) / 100,
            ]),
            shapeId,
            size,
            zIndex: stackingKeyAboveLayer(shapes, boardLayerOf(type)),
          })
        );

        return shapeId;
      }
    ),
  }),
});

export type BoardStrokeElement = ElementOf<typeof BaseBoardStrokePlugin>;
