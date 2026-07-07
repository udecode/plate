import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Enables support for bold formatting */
export const BaseBoldPlugin = createBasePlugin({
  key: KEYS.bold,
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
  render: { as: 'strong' },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
