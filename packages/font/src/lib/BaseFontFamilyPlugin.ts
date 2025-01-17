import { createSlatePlugin } from '@udecode/plate';

export const BaseFontFamilyPlugin = createSlatePlugin({
  key: 'fontFamily',
  inject: {
    nodeProps: {
      nodeKey: 'fontFamily',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        parse: ({ element, type }) => ({ [type]: element.style.fontFamily }),
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
});
