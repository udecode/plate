import { createSlatePlugin } from '@udecode/plate-common';

export const FontFamilyPlugin = createSlatePlugin({
  inject: {
    props: {
      nodeKey: 'fontFamily',
    },
  },
  key: 'fontFamily',
}).extend(({ type }) => ({
  deserializeHtml: {
    getNode: ({ element }) => ({ [type]: element.style.fontFamily }),
    isLeaf: true,
    rules: [
      {
        validStyle: {
          fontFamily: '*',
        },
      },
    ],
  },
}));
