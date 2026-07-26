import { createBasePlugin, someHtmlElement } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

/** Enables support for italic formatting. */
export const BaseItalicPlugin = createBasePlugin({
  key: KEYS.italic,
  schema: {
    mark: property.boolean({ default: false, omitDefault: true }),
  },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) =>
          someHtmlElement(element, (node) => node.style.fontStyle === 'normal')
            ? undefined
            : true,
        encode: ({ value }) => (value ? { tag: 'em' } : null),
        match: [{ tag: ['em', 'i'] }, { style: { fontStyle: 'italic' } }],
      },
    }),

  render: { as: 'em' },
  update: ({ tx, type }) => ({
    toggle: () => {
      tx.marks.toggle(type);
    },
  }),
});
