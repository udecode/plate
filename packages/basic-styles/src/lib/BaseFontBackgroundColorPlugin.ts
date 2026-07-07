import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseFontBackgroundColorPlugin = createBasePlugin({
  key: KEYS.backgroundColor,
  inject: {
    nodeProps: {
      nodeKey: 'backgroundColor',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
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
