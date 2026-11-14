import { type ElementOf, property } from '../../../core';
import { BOARD_NOTE_SIZE, defineBoardShape } from './boardShape.internal';

/** A sticky note on a board, holding rich text. */
export const BaseBoardNotePlugin = defineBoardShape('boardNote', {
  properties: {
    fill: property.string({ default: 'yellow' }),
  },
  size: BOARD_NOTE_SIZE,
}).extend(({ defineFormats }) => ({
  formats: defineFormats({
    markdown: {
      encode: ({ encodeFlow, node }) => encodeFlow(node.children),
    },
  }),
}));

export type BoardNoteElement = ElementOf<typeof BaseBoardNotePlugin>;
