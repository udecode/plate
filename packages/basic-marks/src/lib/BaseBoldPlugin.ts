import { createSlatePlugin, someHtmlElement } from '@udecode/plate';

/** Enables support for bold formatting */
export const BaseBoldPlugin = createSlatePlugin({
  key: 'bold',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['STRONG', 'B'] },
          {
            validStyle: {
              fontWeight: ['600', '700', 'bold'],
            },
          },
        ],
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.fontWeight === 'normal'
          ),
      },
    },
  },
});
