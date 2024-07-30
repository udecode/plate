import { createPlugin } from '@udecode/plate-common/server';

export const MARK_BG_COLOR = 'backgroundColor';

export const FontBackgroundColorPlugin = createPlugin({
  inject: {
    props: {
      nodeKey: MARK_BG_COLOR,
    },
  },
  key: MARK_BG_COLOR,
}).extend((_, { type }) => ({
  deserializeHtml: {
    getNode: (element) => ({ [type]: element.style.backgroundColor }),
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
