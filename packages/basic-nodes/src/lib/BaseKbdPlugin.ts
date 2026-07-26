import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for code formatting */
export const BaseKbdPlugin = createBasePlugin({
  key: KEYS.kbd,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'kbd' } : null),
        match: [{ tag: 'kbd' }],
      },
    }),

  render: { as: 'kbd' },
  rules: { selection: { affinity: 'hard' } },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});
