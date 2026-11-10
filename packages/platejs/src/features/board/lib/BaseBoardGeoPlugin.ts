import { type ElementOf, property } from '../../../core';
import { defineBoardShape } from './boardShape.internal';

/** A geometric shape on a board, with a text label. */
export const BaseBoardGeoPlugin = defineBoardShape('boardGeo', {
  properties: {
    fill: property.string({ default: 'none' }),
    geo: property.enum(['diamond', 'ellipse', 'rectangle', 'triangle'], {
      default: 'rectangle',
    }),
  },
  size: { height: 100, width: 160 },
});

export type BoardGeoElement = ElementOf<typeof BaseBoardGeoPlugin>;
