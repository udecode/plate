import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for code formatting */
export const KbdPlugin = createSlatePlugin({
  deserializeHtml: {
    rules: [{ validNodeName: ['KBD'] }],
  },
  isLeaf: true,
  key: 'kbd',
});
