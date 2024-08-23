import { createSlatePlugin, someHtmlElement } from '@udecode/plate-common';

/** Enables support for underline formatting. */
export const UnderlinePlugin = createSlatePlugin({
  isLeaf: true,
  key: 'underline',
  parsers: {
    html: {
      deserializer: {
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.textDecoration === 'none'
          ),
        rules: [
          { validNodeName: ['U'] },
          { validStyle: { textDecoration: ['underline'] } },
        ],
      },
    },
  },
});
