import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for code formatting */
export const BaseKbdPlugin = createSlatePlugin({
  key: 'kbd',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: ['KBD'] }],
      },
    },
  },
});
