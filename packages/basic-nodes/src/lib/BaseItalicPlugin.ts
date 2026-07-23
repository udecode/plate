import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for italic formatting. */
export const BaseItalicPlugin = createBasePlugin({
  key: KEYS.italic,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
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
  render: { as: 'em' },
}).extendTx(({ type }) => (tx) => ({
  toggle: () => {
    tx.marks.toggle(type);
  },
}));
