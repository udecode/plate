import { createSlatePlugin } from '@udecode/plate';

export const BaseFontWeightPlugin = createSlatePlugin({
  key: 'fontWeight',
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
        parse: ({ element, type }) => ({ [type]: element.style.fontWeight }),
      },
    },
  },
});
