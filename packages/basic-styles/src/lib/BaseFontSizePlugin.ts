import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontSizePlugin = createBasePlugin({
  key: KEYS.fontSize,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      styleKey: 'fontSize',
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validStyle: {
              fontSize: '*',
            },
          },
        ],
        parse: ({ element, type }) => ({
          [type]: element.style.fontSize,
        }),
      },
    },
  },
}).extendTx(({ type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(type, value);
  },
}));
