import { createBasePlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

export const BaseFontColorPlugin = createBasePlugin({
  key: KEYS.color,
  inject: {
    nodeProps: {
      defaultNodeValue: 'black',
      nodeKey: 'color',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              color: '*',
            },
          },
        ],
        parse({ element, type }) {
          if (element.style.color) {
            return { [type]: element.style.color };
          }
        },
      },
    },
  },
}).extendTx(({ type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(type, value);
  },
}));
