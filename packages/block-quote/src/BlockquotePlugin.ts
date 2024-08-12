import { type HotkeyPluginOptions, createPlugin } from '@udecode/plate-common';
import { onKeyDownToggleElement } from '@udecode/plate-common/react';

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
