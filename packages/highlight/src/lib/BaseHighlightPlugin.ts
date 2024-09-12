import { createSlatePlugin } from '@udecode/plate-common';

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const BaseHighlightPlugin = createSlatePlugin({
  key: 'highlight',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validNodeName: ['MARK'],
          },
        ],
      },
    },
  },
});
