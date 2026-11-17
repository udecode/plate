import type { ElementOf } from '../../../core';
import { BOARD_NOTE_SIZE, defineBoardShape } from './boardShape.internal';
import { BOARD_NOTE_STYLES } from './boardStyle.internal';

/** A sticky note on a board, holding rich text. */
export const BaseBoardNotePlugin = defineBoardShape('boardNote', {
  properties: {},
  size: BOARD_NOTE_SIZE,
  styles: BOARD_NOTE_STYLES,
}).extend(({ defineFormats }) => ({
  formats: defineFormats({
    markdown: {
      encode: ({ encodeFlow, node }) => encodeFlow(node.children),
    },
  }),
}));

export type BoardNoteElement = ElementOf<typeof BaseBoardNotePlugin>;
