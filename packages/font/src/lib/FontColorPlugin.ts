import { createSlatePlugin } from '@udecode/plate-common';

export const FontColorPlugin = createSlatePlugin({
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
