import { createSlatePlugin } from '@udecode/plate-common';

export const FontWeightPlugin = createSlatePlugin({
  inject: {
    props: {
      nodeKey: 'fontWeight',
    },
  },
  key: 'fontWeight',
}).extend(({ type }) => ({
  deserializeHtml: {
    getNode: ({ element }) => ({ [type]: element.style.fontWeight }),
    isLeaf: true,
    rules: [
      {
        validStyle: {
          fontWeight: '*',
        },
      },
    ],
  },
}));
