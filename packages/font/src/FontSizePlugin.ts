import { createPlugin } from '@udecode/plate-common/server';

export const MARK_FONT_SIZE = 'fontSize';

export const FontSizePlugin = createPlugin({
  inject: {
    props: {
      nodeKey: MARK_FONT_SIZE,
    },
  },
  key: MARK_FONT_SIZE,
}).extend((_, { type }) => ({
  deserializeHtml: {
    getNode: (element) => ({ [type]: element.style.fontSize }),
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
