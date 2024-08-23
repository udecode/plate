import { createSlatePlugin, someHtmlElement } from '@udecode/plate-common';

/** Enables support for italic formatting. */
export const ItalicPlugin = createSlatePlugin({
  isLeaf: true,
  key: 'italic',
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
