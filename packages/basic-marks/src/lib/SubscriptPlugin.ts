import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for subscript formatting. */
export const SubscriptPlugin = createSlatePlugin({
  deserializeHtml: {
    rules: [
      { validNodeName: ['SUB'] },
      { validStyle: { verticalAlign: 'sub' } },
    ],
  },
  isLeaf: true,
  key: 'subscript',
});
