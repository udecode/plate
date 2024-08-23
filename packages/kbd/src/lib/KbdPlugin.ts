import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for code formatting */
export const KbdPlugin = createSlatePlugin({
  isLeaf: true,
  key: 'kbd',
  parsers: {
    html: {
      deserializer: {
        rules: [{ validNodeName: ['KBD'] }],
      },
    },
  },
});
