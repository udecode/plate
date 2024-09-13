import { createSlatePlugin } from '@udecode/plate-common';

export const BaseFontWeightPlugin = createSlatePlugin({
  key: 'fontWeight',
  inject: {
    nodeProps: {
      nodeKey: 'fontWeight',
    },
  },
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        parse: ({ element }) => ({ [type]: element.style.fontWeight }),
        rules: [
          {
            validStyle: {
              fontWeight: '*',
            },
          },
        ],
      },
    },
  },
}));
