import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontFamilyPlugin = createBasePlugin({
  key: KEYS.fontFamily,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      styleKey: 'fontFamily',
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validStyle: {
              fontFamily: '*',
            },
          },
        ],
        parse: ({ element, type }) => ({
          [type]: element.style.fontFamily,
        }),
      },
    },
  },
}).extendTx(({ type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(type, value);
  },
}));
