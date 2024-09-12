import { createSlatePlugin } from '@udecode/plate-common';

import { withBlockquote } from './withBlockquote';

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = createSlatePlugin({
  extendEditor: withBlockquote,
  key: 'blockquote',
  node: { isElement: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: 'BLOCKQUOTE',
          },
        ],
      },
    },
  },
});
