import { createBasePlugin } from '@platejs/core';
import { property } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const BaseFontBackgroundColorPlugin = createBasePlugin({
  key: KEYS.backgroundColor,
  schema: { mark: property.string() },
  inject: {
    nodeProps: {
      styleKey: 'backgroundColor',
    },
  },
  parsers: {
    html: {
      deserializer: {
        rules: [
          {
            validStyle: {
              backgroundColor: '*',
            },
          },
        ],
        parse: ({ element, type }) => ({
          [type]: element.style.backgroundColor,
        }),
      },
    },
  },
}).extendTx(({ type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(type, value);
  },
}));
