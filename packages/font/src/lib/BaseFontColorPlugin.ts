import { createSlatePlugin } from '@udecode/plate';

export const BaseFontColorPlugin = createSlatePlugin({
  key: 'color',
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
        parse({ element, type }) {
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
});
