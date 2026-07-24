import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for code formatting */
export const BaseKbdPlugin = createBasePlugin({
  key: KEYS.kbd,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 'kbd' },
  rules: { selection: { affinity: 'hard' } },
})
  .extendHtmlCodec(() => ({
    decode: () => true,
    encode: ({ value }) => (value ? { tag: 'kbd' } : null),
    match: [{ tag: 'kbd' }],
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }));
