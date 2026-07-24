import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for bold formatting */
export const BaseBoldPlugin = createBasePlugin({
  key: KEYS.bold,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 'strong' },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) =>
      someHtmlElement(element, (node) => node.style.fontWeight === 'normal')
        ? undefined
        : true,
    encode: ({ value }) => (value ? { tag: 'strong' } : null),
    match: [
      { tag: ['strong', 'b'] },
      { style: { fontWeight: ['600', '700', 'bold'] } },
    ],
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }));
