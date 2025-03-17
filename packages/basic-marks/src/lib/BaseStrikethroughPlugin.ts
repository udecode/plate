import { createSlatePlugin, someHtmlElement } from '@udecode/plate';

/** Enables support for strikethrough formatting. */
export const BaseStrikethroughPlugin = createSlatePlugin({
  key: 'strikethrough',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['S', 'DEL', 'STRIKE'] },
          { validStyle: { textDecoration: 'line-through' } },
        ],
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.textDecoration === 'none'
          ),
      },
    },
  },
});
