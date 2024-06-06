import { createPluginFactory } from '@udecode/plate-common/server';

export const MARK_COLOR = 'color';

export const createFontColorPlugin = createPluginFactory({
  inject: {
    props: {
      defaultNodeValue: 'black',
      nodeKey: MARK_COLOR,
    },
  },
  key: MARK_COLOR,
  then: (editor, { type }) => ({
    deserializeHtml: {
      getNode(element) {
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
  }),
});
