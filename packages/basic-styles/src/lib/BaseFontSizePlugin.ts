import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseFontSizePlugin = createBasePlugin({
  key: KEYS.fontSize,
  inject: {
    nodeProps: {
      nodeKey: 'fontSize',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
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
