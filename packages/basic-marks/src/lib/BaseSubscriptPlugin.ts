import { createSlatePlugin, KEYS } from '@udecode/plate';

/** Enables support for subscript formatting. */
export const BaseSubscriptPlugin = createSlatePlugin({
  key: KEYS.sub,
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
