import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for bold formatting */
export const BaseBoldPlugin = createBasePlugin({
  key: KEYS.bold,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          someHtmlElement(element, (node) => node.style.fontWeight === 'normal')
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 'strong' } : null),
        match: [
          { tag: ['strong', 'b'] },
          { style: { fontWeight: ['600', '700', 'bold'] } },
        ],
      },
    }),

  render: { as: 'strong' },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});
