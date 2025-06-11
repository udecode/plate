import { createSlatePlugin, KEYS } from 'platejs';

/** Enables support for code formatting */
export const BaseKbdPlugin = createSlatePlugin({
  key: KEYS.kbd,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: ['KBD'] }],
      },
    },
  },
});
