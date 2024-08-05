import { createPlugin } from '@udecode/plate-common/server';

export const MARK_COLOR = 'color';

export const FontColorPlugin = createPlugin({
  inject: {
    props: {
      defaultNodeValue: 'black',
      nodeKey: MARK_COLOR,
    },
  },
  key: MARK_COLOR,
}).extend(({ plugin: { type } }) => ({
  deserializeHtml: {
    getNode({ element }) {
      if (element.style.color) {
        return { [type]: element.style.color };
      }
    },
    isLeaf: true,
    rules: [
      {
        validStyle: {
          color: '*',
        },
      },
    ],
  },
}));
