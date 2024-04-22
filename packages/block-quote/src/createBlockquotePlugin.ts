import {
  createPluginFactory,
  HotkeyPlugin,
  onKeyDownToggleElement,
} from '@udecode/plate-common';

import { withBlockQuote } from './withBlockQuote';

export const ELEMENT_BLOCKQUOTE = 'blockquote';

/**
 * Enables support for block quotes, useful for
 * quotations and passages.
 */
export const createBlockquotePlugin = createPluginFactory<HotkeyPlugin>({
  key: ELEMENT_BLOCKQUOTE,
  isElement: true,
  withOverrides: withBlockQuote,
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'BLOCKQUOTE',
      },
    ],
  },
  handlers: {
    onKeyDown: onKeyDownToggleElement,
  },
  options: {
    hotkey: 'mod+shift+.',
  },
});
