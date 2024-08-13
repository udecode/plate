import { createPlugin } from '@udecode/plate-common';

export const FontFamilyPlugin = createPlugin({
  inject: {
    props: {
      nodeKey: 'fontFamily',
    },
  },
  key: 'fontFamily',
}).extend(({ plugin: { type } }) => ({
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
