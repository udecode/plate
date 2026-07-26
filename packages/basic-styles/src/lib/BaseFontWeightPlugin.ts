import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontWeightPlugin = createBasePlugin({
  key: KEYS.fontWeight,
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.fontWeight || undefined,
        encode: ({ value }) => ({
          style: { fontWeight: value },
          tag: 'span',
        }),
        match: [{ style: { fontWeight: '*' } }],
      },
    }),

  inject: {
    nodeProps: {
      styleKey: 'fontWeight',
    },
  },
  update: ({ tx, type }) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }),
});
