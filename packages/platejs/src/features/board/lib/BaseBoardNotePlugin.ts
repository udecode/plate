import { type ElementOf, property } from '../../../core';
import { defineBoardShape } from './boardShape.internal';

/** A sticky note on a board, holding rich text. */
export const BaseBoardNotePlugin = defineBoardShape('boardNote', {
  properties: {
    color: property.string({ default: 'yellow' }),
  },
  size: { height: 200, width: 200 },
});

export type BoardNoteElement = ElementOf<typeof BaseBoardNotePlugin>;
