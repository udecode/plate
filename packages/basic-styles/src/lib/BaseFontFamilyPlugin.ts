import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontFamilyPlugin = createBasePlugin({
  key: KEYS.fontFamily,
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.fontFamily || undefined,
        encode: ({ value }) => ({
          style: { fontFamily: value },
          tag: 'span',
        }),
        match: [{ style: { fontFamily: '*' } }],
      },
    }),

  inject: {
    nodeProps: {
      styleKey: 'fontFamily',
    },
  },
  update: ({ tx, type }) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }),
});
