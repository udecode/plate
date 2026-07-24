import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for italic formatting. */
export const BaseItalicPlugin = createBasePlugin({
  key: KEYS.italic,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 'em' },
})
  .extendHtmlCodec(() => ({
    decode: ({ element }) =>
      someHtmlElement(element, (node) => node.style.fontStyle === 'normal')
        ? undefined
        : true,
    encode: ({ value }) => (value ? { tag: 'em' } : null),
    match: [{ tag: ['em', 'i'] }, { style: { fontStyle: 'italic' } }],
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }));
