import { createSlatePlugin } from '@udecode/plate-common';

export const FontColorPlugin = createSlatePlugin({
  inject: {
    nodeProps: {
      defaultNodeValue: 'black',
      nodeKey: 'color',
    },
  },
  key: 'color',
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
