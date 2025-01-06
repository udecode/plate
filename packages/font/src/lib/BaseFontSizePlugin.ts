import { createSlatePlugin } from '@udecode/plate';

export const BaseFontSizePlugin = createSlatePlugin({
  key: 'fontSize',
  inject: {
    nodeProps: {
      nodeKey: 'fontSize',
    },
  },
}).extend(({ type }) => ({
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        parse: ({ element }) => ({ [type]: element.style.fontSize }),
        rules: [
          {
            validStyle: {
              fontSize: '*',
            },
          },
        ],
      },
    },
  },
}));
