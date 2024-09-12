import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for superscript formatting. */
export const BaseSuperscriptPlugin = createSlatePlugin({
  key: 'superscript',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['SUP'] },
          { validStyle: { verticalAlign: 'super' } },
        ],
      },
    },
  },
});
