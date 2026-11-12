import { nanoid } from 'nanoid';

import {
  definePlugin,
  type ElementOf,
  locateAt,
  type NodeKey,
  property,
  txLocate,
} from '../../../core';
import {
  BOARD_FRAME_SIZE,
  BOARD_FRAME_TYPE,
  boardFramesIn,
  boardLayerOf,
  boardPointOf,
  boxHolds,
  framedPlace,
  isFrameable,
} from './boardFrame.internal';
import {
  appendBoardMember,
  boardShapesRootOf,
  stackingKeyAboveLayer,
} from './boardShape.internal';

/**
 * A frame on a board: a void that holds the shapes whose places name it.
 * Frames paint behind every other shape and hold no frame.
 */
export const BaseBoardFramePlugin = definePlugin(BOARD_FRAME_TYPE, {
  schema: {
    element: {
      blockContent: false,
      properties: {
        name: property.string(),
      },
      void: 'block',
    },
  },
  update: ({ tx }) => ({
    /**
     * Add a frame above every frame of the board block `board`, with its
     * origin at its place, and return its id. It takes in each shape that
     * lies wholly in it and is in no other frame. Return undefined when
     * `board` is no board.
     */
    insert: txLocate(
      locateAt(1, 'board'),
      (
        {
          height = BOARD_FRAME_SIZE.height,
          name,
          width = BOARD_FRAME_SIZE.width,
          x,
          y,
        }: Readonly<{
          height?: number;
          name?: string;
          width?: number;
          x: number;
          y: number;
        }>,
        { board }: Readonly<{ board: NodeKey }>
      ) => {
        const root = boardShapesRootOf(tx, board);

        if (!root) return undefined;

        const shapes = tx.root(root);
        const frames = boardFramesIn(shapes);
        const shapeId = nanoid();
        const origin = { x, y };
        const box = { place: origin, size: { height, width } };
        const taken = shapes.flatMap((node) => {
          if (!isFrameable(node)) return [];

          const { frame, point } = boardPointOf(node.place, (id) =>
            frames.get(id)
          );

          return frame === undefined &&
            boxHolds(box, { place: point, size: node.size })
            ? [{ key: tx.key(node), point }]
            : [];
        });

        appendBoardMember(
          tx,
          root,
          tx.schema.create(BOARD_FRAME_TYPE, {
            ...(name === undefined ? {} : { name }),
            place: { origin, x, y },
            shapeId,
            size: { height, width },
            zIndex: stackingKeyAboveLayer(
              shapes,
              boardLayerOf(BOARD_FRAME_TYPE)
            ),
          })
        );
        for (const { key, point } of taken) {
          tx.nodes.set(
            { place: framedPlace({ id: shapeId, origin }, point) },
            { at: key }
          );
        }

        return shapeId;
      }
    ),
  }),
});

export type BoardFrameElement = ElementOf<typeof BaseBoardFramePlugin>;
