import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for superscript formatting. */
export const SuperscriptPlugin = createSlatePlugin({
  deserializeHtml: {
    rules: [
      { validNodeName: ['SUP'] },
      { validStyle: { verticalAlign: 'super' } },
    ],
  },
  isLeaf: true,
  key: 'superscript',
});
