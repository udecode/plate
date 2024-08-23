import { createSlatePlugin } from '@udecode/plate-common';

export const FontWeightPlugin = createSlatePlugin({
  inject: {
    props: {
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
