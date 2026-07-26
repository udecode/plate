import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontColorPlugin = createBasePlugin({
  key: KEYS.color,
  schema: { mark: property.string() },
  codecs: ({ defineCodecs }) =>
    defineCodecs({
      'text/html': {
        decode: ({ element }) => element.style.color || undefined,
        encode: ({ value }) => ({
          style: { color: value },
          tag: 'span',
        }),
        match: [{ style: { color: '*' } }],
      },
    }),

  inject: {
    nodeProps: {
      defaultNodeValue: 'black',
      styleKey: 'color',
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
