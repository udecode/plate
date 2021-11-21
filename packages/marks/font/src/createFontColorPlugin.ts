import { createPluginFactory } from '@udecode/plate-core';

export const MARK_COLOR = 'color';

export const createFontColorPlugin = createPluginFactory({
  key: MARK_COLOR,
  inject: {
    props: {
      nodeKey: MARK_COLOR,
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
      validStyle: {
        color: '*',
      },
    },
  }),
});
