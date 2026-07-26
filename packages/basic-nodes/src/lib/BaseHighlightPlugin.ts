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
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'mark' } : null),
        match: [{ tag: 'mark' }],
      },
    }),

  render: { as: 'mark' },
  rules: { selection: { affinity: 'directional' } },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});
