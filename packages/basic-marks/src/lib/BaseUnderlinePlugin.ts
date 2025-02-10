import { createSlatePlugin, someHtmlElement } from '@udecode/plate';

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = createSlatePlugin({
  key: 'underline',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['U'] },
          { validStyle: { textDecoration: ['underline'] } },
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
