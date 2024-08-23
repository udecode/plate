import { createSlatePlugin, someHtmlElement } from '@udecode/plate-common';

/** Enables support for strikethrough formatting. */
export const StrikethroughPlugin = createSlatePlugin({
  isLeaf: true,
  key: 'strikethrough',
  parsers: {
    html: {
      deserializer: {
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.textDecoration === 'none'
          ),
        rules: [
          { validNodeName: ['S', 'DEL', 'STRIKE'] },
          { validStyle: { textDecoration: 'line-through' } },
        ],
      },
    },
  },
});
