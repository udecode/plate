import { createSlatePlugin } from '@udecode/plate-common';

export const FontBackgroundColorPlugin = createSlatePlugin({
  inject: {
    props: {
      nodeKey: 'backgroundColor',
    },
  },
  key: 'backgroundColor',
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        parse: ({ element }) => ({ [type]: element.style.backgroundColor }),
        rules: [
          {
            validStyle: {
              backgroundColor: '*',
            },
          },
        ],
      },
    },
  },
}));
