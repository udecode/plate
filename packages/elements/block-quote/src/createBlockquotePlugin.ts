import { getToggleElementOnKeyDown, HotkeyPlugin } from '@udecode/plate-common';
import { createPlugin } from '@udecode/plate-core';
import { getBlockquoteDeserialize } from './getBlockquoteDeserialize';

export const ELEMENT_BLOCKQUOTE = 'blockquote';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const createBlockquotePlugin = createPlugin<HotkeyPlugin>({
  key: ELEMENT_BLOCKQUOTE,
  isElement: true,
  deserialize: getBlockquoteDeserialize(),
  onKeyDown: getToggleElementOnKeyDown(),
  hotkey: 'mod+shift+.',
});
