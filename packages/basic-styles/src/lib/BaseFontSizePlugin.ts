import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontSizePlugin = createBasePlugin({
  key: KEYS.fontSize,
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.fontSize || undefined,
        encode: ({ value }) => ({
          style: { fontSize: value },
          tag: 'span',
        }),
        match: [{ style: { fontSize: '*' } }],
      },
    }),

  inject: {
    nodeProps: {
      styleKey: 'fontSize',
    },
  },
  update: ({ tx, type }) => ({
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }),
});
