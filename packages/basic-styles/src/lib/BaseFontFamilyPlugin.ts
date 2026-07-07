import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseFontFamilyPlugin = createBasePlugin({
  key: KEYS.fontFamily,
  inject: {
    nodeProps: {
      nodeKey: 'fontFamily',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
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
