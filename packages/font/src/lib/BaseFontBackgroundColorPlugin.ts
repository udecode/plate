import { createSlatePlugin } from '@udecode/plate-common';

export const BaseFontBackgroundColorPlugin = createSlatePlugin({
  key: 'backgroundColor',
  inject: {
    nodeProps: {
      nodeKey: 'backgroundColor',
    },
  },
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
