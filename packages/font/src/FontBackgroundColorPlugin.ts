import { createSlatePlugin } from '@udecode/plate-common';

export const FontBackgroundColorPlugin = createSlatePlugin({
  inject: {
    props: {
      nodeKey: 'backgroundColor',
    },
  },
  key: 'backgroundColor',
}).extend(({ type }) => ({
  deserializeHtml: {
    getNode: ({ element }) => ({ [type]: element.style.backgroundColor }),
    isLeaf: true,
    rules: [
      {
        validStyle: {
          backgroundColor: '*',
        },
      },
    ],
  },
}));
