import { createEditorPlugin, KEYS, someHtmlElement } from 'platejs';

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = createEditorPlugin({
  key: KEYS.underline,
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
  render: { as: 'u' },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
