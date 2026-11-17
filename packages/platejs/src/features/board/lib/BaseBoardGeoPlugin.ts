import { type ElementOf, property } from '../../../core';
import {
  BOARD_GEO_DEFAULT,
  BOARD_GEO_SIZE,
  BOARD_GEO_TYPE,
  BOARD_GEOS,
  defineBoardShape,
} from './boardShape.internal';
import { BOARD_GEO_STYLES } from './boardStyle.internal';

/** The outline a geo shape draws. */
export type BoardGeo = (typeof BOARD_GEOS)[number];

/** A geometric shape on a board, with a text label. */
export const BaseBoardGeoPlugin = defineBoardShape(BOARD_GEO_TYPE, {
  properties: {
    geo: property.enum(BOARD_GEOS, { default: BOARD_GEO_DEFAULT }),
  },
  size: BOARD_GEO_SIZE,
  styles: BOARD_GEO_STYLES,
}).extend(({ defineFormats }) => ({
  formats: defineFormats({
    markdown: {
      encode: ({ encodeFlow, node }) => encodeFlow(node.children),
    },
  }),
}));

export type BoardGeoElement = ElementOf<typeof BaseBoardGeoPlugin>;
