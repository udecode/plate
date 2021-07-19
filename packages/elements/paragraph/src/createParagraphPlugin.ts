import { getToggleElementOnKeyDown } from '@udecode/plate-common';
import { getRenderElement, PlatePlugin } from '@udecode/plate-core';
import { ELEMENT_PARAGRAPH } from './defaults';
import { getParagraphDeserialize } from './getParagraphDeserialize';

/**
 * Enables support for paragraphs.
 */
export const createParagraphPlugin = (): PlatePlugin => ({
  pluginKeys: ELEMENT_PARAGRAPH,
  renderElement: getRenderElement(ELEMENT_PARAGRAPH),
  deserialize: getParagraphDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_PARAGRAPH),
});
