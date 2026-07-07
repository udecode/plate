import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { KEYS } from '@platejs/utils';

/** Enables support for strikethrough formatting. */
export const BaseStrikethroughPlugin = createBasePlugin({
  key: KEYS.strikethrough,
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
  render: { as: 's' },
  rules: { selection: { affinity: 'directional' } },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
