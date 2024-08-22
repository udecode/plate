import { createTSlatePlugin } from '@udecode/plate-common';

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const HighlightPlugin = createTSlatePlugin({
  deserializeHtml: {
    rules: [
      {
        validNodeName: ['MARK'],
      },
    ],
  },
  isLeaf: true,
  key: 'highlight',
});
