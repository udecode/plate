import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_PARAGRAPH } from './defaults';
import { getParagraphDeserialize } from './getParagraphDeserialize';

/**
 * Enables support for paragraphs.
 */
export const createParagraphPlugin = (): PlatePlugin => ({
  key: ELEMENT_PARAGRAPH,
  isElement: true,
  deserialize: getParagraphDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_PARAGRAPH),
});
