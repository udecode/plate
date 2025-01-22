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
        parse: ({ element, type }) => ({
          [type]: element.style.backgroundColor,
        }),
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
});
