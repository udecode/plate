import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for strikethrough formatting. */
export const BaseStrikethroughPlugin = createBasePlugin({
  key: KEYS.strikethrough,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 's' },
  rules: { selection: { affinity: 'directional' } },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) =>
      someHtmlElement(element, (node) => node.style.textDecoration === 'none')
        ? undefined
        : true,
    encode: ({ value }) => (value ? { tag: 's' } : null),
    match: [
      { tag: ['s', 'del', 'strike'] },
      { style: { textDecoration: 'line-through' } },
    ],
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }));
