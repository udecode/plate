import { AnyObject, createPluginFactory } from '@udecode/plate-common';

export const MARK_COLOR = 'color';

export const createFontColorPlugin = createPluginFactory<AnyObject>({
  key: MARK_COLOR,
  inject: {
    props: {
      nodeKey: MARK_COLOR,
      defaultNodeValue: 'black',
    },
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      isLeaf: true,
      getNode(element) {
        if (element.style.color) {
          return { [type]: element.style.color };
        }
      },
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
