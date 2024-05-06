import { createPluginFactory } from '@udecode/plate-common/server';

export const MARK_FONT_SIZE = 'fontSize';

export const createFontSizePlugin = createPluginFactory({
  inject: {
    props: {
      nodeKey: MARK_FONT_SIZE,
    },
  },
  key: MARK_FONT_SIZE,
  then: (editor, { type }) => ({
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
  }),
});
