import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = createBasePlugin({
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
