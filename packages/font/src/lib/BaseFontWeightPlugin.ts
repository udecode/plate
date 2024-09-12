import { createSlatePlugin } from '@udecode/plate-common';

export const BaseFontWeightPlugin = createSlatePlugin({
  inject: {
    nodeProps: {
      nodeKey: 'fontWeight',
    },
  },
  key: 'fontWeight',
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
