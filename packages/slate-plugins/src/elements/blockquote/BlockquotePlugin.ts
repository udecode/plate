import {
  getPluginOnKeyDownElement,
  getPluginRenderElement,
} from '@udecode/slate-plugins-common';
import { SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_BLOCKQUOTE } from './defaults';
import { useDeserializeBlockquote } from './useDeserializeBlockquote';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const BlockquotePlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_BLOCKQUOTE,
  renderElement: getPluginRenderElement(ELEMENT_BLOCKQUOTE),
  deserialize: useDeserializeBlockquote(),
  onKeyDown: getPluginOnKeyDownElement(ELEMENT_BLOCKQUOTE),
});
