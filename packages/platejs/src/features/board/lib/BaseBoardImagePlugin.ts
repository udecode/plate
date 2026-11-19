import { nanoid } from 'nanoid';

import {
  definePlugin,
  type Descendant,
  type ElementOf,
  locateAt,
  type NodeKey,
  PLUGINS,
  schema,
  txLocate,
} from '../../../core';
import { boardFramesIn, boardLayerOf, placeAmong } from './boardFrame.internal';
import {
  appendBoardMember,
  boardShapesRootOf,
  stackingKeyAboveLayer,
} from './boardShape.internal';

/**
 * A picture on a board: an object block holding at most one child, its image
 * element or an upload draft. An editor with this shape installs the image
 * plugin, the upload plugin or both.
 */
export const BaseBoardImagePlugin = definePlugin('boardImage', {
  schema: ({ targetElementTypes }) => {
    if (targetElementTypes.length === 0) {
      throw new Error(
        `Board image shapes hold an image, so install the "${PLUGINS.image}" plugin, the "${PLUGINS.upload}" plugin or both.`
      );
    }

    return {
      element: {
        blockContent: false,
        content: schema.content.types(targetElementTypes, { max: 1, min: 0 }),
        object: true,
      },
    };
  },
  targetPlugins: [PLUGINS.image, PLUGINS.upload],
  update: ({ schema: { type }, tx }) => ({
    /**
     * Add an image shape holding `children`, one image element or upload
     * draft, at `x` and `y` above every shape of the board block `board`, and
     * return its id. It is 320 by 240 unless `width` and `height` say
     * otherwise, and it joins the frame `frame` names when it overlaps it, or
     * else the frontmost frame under its middle. Return undefined when `board`
     * is no board or a number is not finite.
     */
    insert: txLocate(
      locateAt(1, 'board'),
      (
        {
          children,
          frame,
          height = 240,
          width = 320,
          x,
          y,
        }: Readonly<{
          children: readonly [Descendant];
          frame?: string;
          height?: number;
          width?: number;
          x: number;
          y: number;
        }>,
        { board }: Readonly<{ board: NodeKey }>
      ) => {
        const root = boardShapesRootOf(tx, board);

        if (!root) return undefined;

        const shapes = tx.root(root);
        const size = { height, width };
        const place = placeAmong(
          boardFramesIn(shapes).values(),
          { place: { x, y }, size },
          { requested: frame }
        );

        if (![place.x, place.y, height, width].every(Number.isFinite)) {
          return undefined;
        }

        const shapeId = nanoid();

        appendBoardMember(tx, root, {
          children: [...children],
          place,
          shapeId,
          size,
          type,
          zIndex: stackingKeyAboveLayer(shapes, boardLayerOf(type)),
        });

        return shapeId;
      }
    ),
  }),
}).extend(({ defineFormats }) => ({
  formats: defineFormats({
    markdown: {
      encode: ({ encodeFlow, node }) => encodeFlow(node.children),
    },
  }),
}));

/** A stored image shape: a board member holding at most one image or upload draft. */
export type BoardImageElement = ElementOf<typeof BaseBoardImagePlugin>;
