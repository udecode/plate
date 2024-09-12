import { createSlatePlugin } from '@udecode/plate-common';

export const BaseFontSizePlugin = createSlatePlugin({
  inject: {
    nodeProps: {
      nodeKey: 'fontSize',
    },
  },
  key: 'fontSize',
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
