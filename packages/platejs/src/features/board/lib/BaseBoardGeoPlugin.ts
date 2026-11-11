import { type ElementOf, property } from '../../../core';
import { defineBoardShape } from './boardShape.internal';

const BOARD_GEOS = ['diamond', 'ellipse', 'rectangle', 'triangle'] as const;

/** The outline a geo shape draws. */
export type BoardGeo = (typeof BOARD_GEOS)[number];

/** A geometric shape on a board, with a text label. */
export const BaseBoardGeoPlugin = defineBoardShape('boardGeo', {
  properties: {
    fill: property.string({ default: 'none' }),
    geo: property.enum(BOARD_GEOS, { default: 'rectangle' }),
  },
  size: { height: 100, width: 160 },
}).extend(({ defineFormats }) => ({
  formats: defineFormats({
    markdown: {
      encode: ({ encodeFlow, node }) => encodeFlow(node.children),
    },
  }),
}));

export type BoardGeoElement = ElementOf<typeof BaseBoardGeoPlugin>;
