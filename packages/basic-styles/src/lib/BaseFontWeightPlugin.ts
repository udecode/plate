import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontWeightPlugin = createBasePlugin({
  key: KEYS.fontWeight,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      styleKey: 'fontWeight',
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validStyle: {
              fontWeight: '*',
            },
          },
        ],
        parse: ({ element, type }) => ({
          [type]: element.style.fontWeight,
        }),
      },
    },
  },
}).extendTx(({ type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(type, value);
  },
}));
