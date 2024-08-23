import { createSlatePlugin } from '@udecode/plate-common';

/** Enables support for superscript formatting. */
export const SuperscriptPlugin = createSlatePlugin({
  isLeaf: true,
  key: 'superscript',
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
