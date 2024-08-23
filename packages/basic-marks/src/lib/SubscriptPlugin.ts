import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for subscript formatting. */
export const SubscriptPlugin = createSlatePlugin({
  isLeaf: true,
  key: 'subscript',
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['SUB'] },
          { validStyle: { verticalAlign: 'sub' } },
        ],
      },
    },
  },
});
