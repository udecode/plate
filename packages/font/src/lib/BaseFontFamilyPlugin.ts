import { createSlatePlugin } from '@udecode/plate-common';

export const BaseFontFamilyPlugin = createSlatePlugin({
  key: 'fontFamily',
  inject: {
    nodeProps: {
      nodeKey: 'fontFamily',
    },
  },
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
