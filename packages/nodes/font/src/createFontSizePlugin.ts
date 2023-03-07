import { createPluginFactory } from '@udecode/plate-common';

export const MARK_FONT_SIZE = 'fontSize';

export const createFontSizePlugin = createPluginFactory({
  key: MARK_FONT_SIZE,
  inject: {
    props: {
      nodeKey: MARK_FONT_SIZE,
    },
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      isLeaf: true,
      getNode: (element) => ({ [type]: element.style.fontSize }),
      rules: [
        {
          validStyle: {
            fontSize: '*',
          },
        },
      ],
    },
  }),
});
