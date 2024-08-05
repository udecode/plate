import {
  type HotkeyPluginOptions,
  createPlugin,
  onKeyDownToggleElement,
} from '@udecode/plate-common/server';

import { withBlockquote } from './withBlockquote';

export const ELEMENT_BLOCKQUOTE = 'blockquote';

/** Enables support for block quotes, useful for quotations and passages. */
export const BlockquotePlugin = createPlugin<'blockquote', HotkeyPluginOptions>(
  {
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
  }
);
