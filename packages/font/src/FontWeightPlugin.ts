import { createPlugin } from '@udecode/plate-common';

export const FontWeightPlugin = createPlugin({
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
