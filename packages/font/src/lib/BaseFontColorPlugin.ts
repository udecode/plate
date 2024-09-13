import { createSlatePlugin } from '@udecode/plate-common';

export const BaseFontColorPlugin = createSlatePlugin({
  key: 'color',
  inject: {
    nodeProps: {
      defaultNodeValue: 'black',
      nodeKey: 'color',
    },
  },
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        parse({ element }) {
          if (element.style.color) {
            return { [type]: element.style.color };
          }
        },
        rules: [
          {
            validStyle: {
              color: '*',
            },
          },
        ],
      },
    },
  },
}));
