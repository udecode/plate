import { createPlugin } from '@udecode/plate-common';

export const FontColorPlugin = createPlugin({
  inject: {
    props: {
      defaultNodeValue: 'black',
      nodeKey: 'color',
    },
  },
  key: 'color',
}).extend(({ type }) => ({
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
