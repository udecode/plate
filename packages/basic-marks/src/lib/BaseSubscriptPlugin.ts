import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for subscript formatting. */
export const BaseSubscriptPlugin = createSlatePlugin({
  key: 'subscript',
  node: { isLeaf: true },
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
