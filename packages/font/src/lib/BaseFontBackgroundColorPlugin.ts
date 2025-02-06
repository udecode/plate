import { createSlatePlugin } from '@udecode/plate';

export const BaseFontBackgroundColorPlugin = createSlatePlugin({
  key: 'backgroundColor',
  inject: {
    nodeProps: {
      nodeKey: 'backgroundColor',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              backgroundColor: '*',
            },
          },
        ],
        parse: ({ element, type }) => ({
          [type]: element.style.backgroundColor,
        }),
      },
    },
  },
});
