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
        rules: [
          {
            validStyle: {
              fontFamily: '*',
            },
          },
        ],
        parse: ({ element, type }) => ({ [type]: element.style.fontFamily }),
      },
    },
  },
});
