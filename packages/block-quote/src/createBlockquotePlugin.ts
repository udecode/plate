import {
  type HotkeyPlugin,
  createPluginFactory,
  onKeyDownToggleElement,
} from '@udecode/plate-common/server';

import { withBlockquote } from './withBlockquote';

export const ELEMENT_BLOCKQUOTE = 'blockquote';

/** Enables support for block quotes, useful for quotations and passages. */
export const createBlockquotePlugin = createPluginFactory<HotkeyPlugin>({
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
  isElement: true,
  key: ELEMENT_BLOCKQUOTE,
  options: {
    hotkey: 'mod+shift+.',
  },
  withOverrides: withBlockquote,
});
