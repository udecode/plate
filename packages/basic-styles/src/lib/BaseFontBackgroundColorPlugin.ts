import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontBackgroundColorPlugin = createBasePlugin({
  key: KEYS.backgroundColor,
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.backgroundColor || undefined,
        encode: ({ value }) => ({
          style: { backgroundColor: value },
          tag: 'span',
        }),
        match: [{ style: { backgroundColor: '*' } }],
      },
    }),

  inject: {
    nodeProps: {
      styleKey: 'backgroundColor',
    },
  },
  update: ({ tx, type }) => ({
    clear: () => {
      tx.marks.remove(type);
    },
    set: (value: string) => {
      tx.marks.add(type, value);
    },
  }),
});
