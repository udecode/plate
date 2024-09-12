import { createSlatePlugin } from '@udecode/plate-common';

export const BaseFontFamilyPlugin = createSlatePlugin({
  inject: {
    nodeProps: {
      nodeKey: 'fontFamily',
    },
  },
  key: 'fontFamily',
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        parse: ({ element }) => ({ [type]: element.style.fontFamily }),
        rules: [
          {
            validStyle: {
              fontFamily: '*',
            },
          },
        ],
      },
    },
  },
}));
