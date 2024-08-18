import { createSlatePlugin } from '@udecode/plate-common';

export const FontSizePlugin = createSlatePlugin({
  inject: {
    props: {
      nodeKey: 'fontSize',
    },
  },
  key: 'fontSize',
}).extend(({ type }) => ({
  deserializeHtml: {
    getNode: ({ element }) => ({ [type]: element.style.fontSize }),
    isLeaf: true,
    rules: [
      {
        validStyle: {
          fontSize: '*',
        },
      },
    ],
  },
}));
