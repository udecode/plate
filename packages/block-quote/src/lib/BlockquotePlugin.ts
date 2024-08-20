import { createSlatePlugin } from '@udecode/plate-common';

import { withBlockquote } from './withBlockquote';

/** Enables support for block quotes, useful for quotations and passages. */
export const BlockquotePlugin = createSlatePlugin({
  deserializeHtml: {
    rules: [
      {
        validNodeName: 'BLOCKQUOTE',
      },
    ],
  },
  isElement: true,
  key: 'blockquote',
  withOverrides: withBlockquote,
});
