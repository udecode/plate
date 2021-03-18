import {
  getPluginOnKeyDownElement,
  getPluginRenderElement,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from './defaults';
import { useDeserializeParagraph } from './useDeserializeParagraph';

/**
 * Enables support for paragraphs.
 */
export const ParagraphPlugin = (): SlatePlugin => ({
  renderElement: getPluginRenderElement(ELEMENT_PARAGRAPH),
  deserialize: useDeserializeParagraph(),
  onKeyDown: getPluginOnKeyDownElement(ELEMENT_PARAGRAPH),
  pluginKeys: [ELEMENT_PARAGRAPH],
});
