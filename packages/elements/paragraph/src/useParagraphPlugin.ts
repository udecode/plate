import {
  useOnKeyDownElement,
  useRenderElement,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_PARAGRAPH } from './defaults';
import { useDeserializeParagraph } from './useDeserializeParagraph';

/**
 * Enables support for paragraphs.
 */
export const useParagraphPlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_PARAGRAPH,
  renderElement: useRenderElement(ELEMENT_PARAGRAPH),
  deserialize: useDeserializeParagraph(),
  onKeyDown: useOnKeyDownElement(ELEMENT_PARAGRAPH),
});
