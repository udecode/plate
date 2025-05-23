import { createSlatePlugin, KEYS, someHtmlElement } from '@udecode/plate';

/** Enables support for italic formatting. */
export const BaseItalicPlugin = createSlatePlugin({
  key: KEYS.italic,
  node: { isLeaf: true },
  parsers: {
    html: {
      deserializer: {
        rules: [
          { validNodeName: ['EM', 'I'] },
          { validStyle: { fontStyle: 'italic' } },
        ],
        query: ({ element }) =>
          !someHtmlElement(
            element,
            (node) => node.style.fontStyle === 'normal'
          ),
      },
    },
  },
});
