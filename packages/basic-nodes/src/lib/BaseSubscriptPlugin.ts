import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for subscript formatting. */
export const BaseSubscriptPlugin = createBasePlugin({
  key: KEYS.sub,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'sub' } : null),
        match: [{ tag: 'sub' }, { style: { verticalAlign: 'sub' } }],
      },
    }),

  render: { as: 'sub' },
  rules: { selection: { affinity: 'directional' } },
  update: ({ editor, tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type, true, {
        clear: editor.getType(KEYS.sup),
      });
    },
  }),
});
