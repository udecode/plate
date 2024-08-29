import { createSlatePlugin, someHtmlElement } from '@udecode/plate-common';

/** Enables support for italic formatting. */
export const ItalicPlugin = createSlatePlugin({
  key: 'italic',
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.fontStyle === 'normal'
          ),
        rules: [
          { validNodeName: ['EM', 'I'] },
          { validStyle: { fontStyle: 'italic' } },
        ],
      },
    },
  },
});
