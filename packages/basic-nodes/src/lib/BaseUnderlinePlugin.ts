import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for underline formatting. */
export const BaseUnderlinePlugin = createBasePlugin({
  key: KEYS.underline,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 'u' },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) =>
      someHtmlElement(element, (node) => node.style.textDecoration === 'none')
        ? undefined
        : true,
    encode: ({ value }) => (value ? { tag: 'u' } : null),
    match: [{ tag: 'u' }, { style: { textDecoration: 'underline' } }],
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }));
