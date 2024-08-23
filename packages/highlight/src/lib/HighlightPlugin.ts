import { createTSlatePlugin } from '@udecode/plate-common';

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const HighlightPlugin = createTSlatePlugin({
  isLeaf: true,
  key: 'highlight',
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
