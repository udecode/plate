import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for superscript formatting. */
export const BaseSuperscriptPlugin = createBasePlugin({
  key: KEYS.sup,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: () => true,
        encode: ({ value }) => (value ? { tag: 'sup' } : null),
        match: [{ tag: 'sup' }, { style: { verticalAlign: 'super' } }],
      },
    }),

  render: { as: 'sup' },
  rules: { selection: { affinity: 'directional' } },
  update: ({ editor, tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type, true, {
        clear: editor.getType(KEYS.sub),
      });
    },
  }),
});
