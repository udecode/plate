import { getToggleElementOnKeyDown } from '@udecode/slate-plugins-common';
import { getRenderElement, SlatePlugin } from '@udecode/slate-plugins-core';
import { ELEMENT_BLOCKQUOTE } from './defaults';
import { getBlockquoteDeserialize } from './getBlockquoteDeserialize';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const createBlockquotePlugin = (): SlatePlugin => ({
  pluginKeys: ELEMENT_BLOCKQUOTE,
  renderElement: getRenderElement(ELEMENT_BLOCKQUOTE),
  deserialize: getBlockquoteDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(ELEMENT_BLOCKQUOTE),
});
