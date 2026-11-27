import { type ElementOf, property } from '../../../core';
import {
  BOARD_TEXT_SIZE,
  BOARD_TEXT_TYPE,
  defineBoardShape,
} from './boardShape.internal';
import { BOARD_TEXT_STYLES } from './boardStyle.internal';

/** Free text on a board, growing with its content while `autoSize` is true until resized. */
export const BaseBoardTextPlugin = defineBoardShape(BOARD_TEXT_TYPE, {
  properties: {
    autoSize: property.boolean({ default: true }),
  },
  size: BOARD_TEXT_SIZE,
  styles: BOARD_TEXT_STYLES,
}).extend(({ defineFormats }) => ({
  formats: defineFormats({
    markdown: {
      encode: ({ encodeFlow, node }) => encodeFlow(node.children),
    },
  }),
}));

/** Element type for a free-text shape on a board. */
export type BoardTextElement = ElementOf<typeof BaseBoardTextPlugin>;
