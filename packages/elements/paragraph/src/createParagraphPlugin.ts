import { getToggleElementOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderElement, SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from './defaults';
import { getParagraphDeserialize } from './getParagraphDeserialize';

/**
 * Enables support for paragraphs.
 */
export const createParagraphPlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_PARAGRAPH,
  renderElement: getRenderElement(ELEMENT_PARAGRAPH),
  deserialize: getParagraphDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_PARAGRAPH),
});
