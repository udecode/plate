import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseFontWeightPlugin = createBasePlugin({
  key: KEYS.fontWeight,
  inject: {
    nodeProps: {
      nodeKey: 'fontWeight',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
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
