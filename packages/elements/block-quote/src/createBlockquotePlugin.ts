import { HotkeyPlugin, onKeyDownToggleElement } from '@udecode/plate-common';
import { createPluginFactory } from '@udecode/plate-core';

export const ELEMENT_BLOCKQUOTE = 'blockquote';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const createBlockquotePlugin = createPluginFactory<HotkeyPlugin>({
  key: ELEMENT_BLOCKQUOTE,
  isElement: true,
  deserializeHtml: {
    validNodeName: 'BLOCKQUOTE',
  },
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: 'mod+shift+.',
  },
});
