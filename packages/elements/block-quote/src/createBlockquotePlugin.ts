import { getToggleElementOnKeyDown, HotkeyPlugin } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';
import { getBlockquoteDeserialize } from './getBlockquoteDeserialize';

export const ELEMENT_BLOCKQUOTE = 'blockquote';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const createBlockquotePlugin = createPluginFactory<HotkeyPlugin>({
  key: ELEMENT_BLOCKQUOTE,
  isElement: true,
  deserialize: getBlockquoteDeserialize(),
  handlers: {
    onKeyDown: getToggleElementOnKeyDown(),
  },
  options: {
    hotkey: 'mod+shift+.',
  },
});
