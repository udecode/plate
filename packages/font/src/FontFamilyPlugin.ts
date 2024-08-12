import { createPlugin } from '@udecode/plate-common';

export const MARK_FONT_FAMILY = 'fontFamily';

export const FontFamilyPlugin = createPlugin({
  inject: {
    props: {
      nodeKey: MARK_FONT_FAMILY,
    },
  },
  key: MARK_FONT_FAMILY,
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
