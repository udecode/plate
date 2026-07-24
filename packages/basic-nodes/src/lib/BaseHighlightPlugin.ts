import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/**
 * Enables support for highlights, useful when reviewing content or highlighting
 * it for future reference.
 */
export const BaseHighlightPlugin = createBasePlugin({
  key: KEYS.highlight,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  render: { as: 'mark' },
  rules: { selection: { affinity: 'directional' } },
})
  .extendHtmlCodec(() => ({
    decode: () => true,
    encode: ({ value }) => (value ? { tag: 'mark' } : null),
    match: [{ tag: 'mark' }],
  }))
  .extendTx(({ type }) => (tx) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }));
