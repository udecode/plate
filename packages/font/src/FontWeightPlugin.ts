import { createPlugin } from '@udecode/plate-common';

export const MARK_FONT_WEIGHT = 'fontWeight';

export const FontWeightPlugin = createPlugin({
  inject: {
    props: {
      nodeKey: MARK_FONT_WEIGHT,
    },
  },
  key: MARK_FONT_WEIGHT,
}).extend(({ plugin: { type } }) => ({
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
