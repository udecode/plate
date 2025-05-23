import { createSlatePlugin, KEYS } from '@udecode/plate';

import { withBlockquote } from './withBlockquote';

/** Enables support for block quotes, useful for quotations and passages. */
export const BaseBlockquotePlugin = createSlatePlugin({
  key: KEYS.blockquote,
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
}).overrideEditor(withBlockquote);
