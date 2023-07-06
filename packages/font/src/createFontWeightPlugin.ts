import { createPluginFactory } from '@udecode/plate-common';

export const MARK_FONT_WEIGHT = 'fontWeight';

export const createFontWeightPlugin = createPluginFactory({
  key: MARK_FONT_WEIGHT,
  inject: {
    props: {
      nodeKey: MARK_FONT_WEIGHT,
    },
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      isLeaf: true,
      getNode: (element) => ({ [type]: element.style.fontWeight }),
      rules: [
        {
          validStyle: {
            fontWeight: '*',
          },
        },
      ],
    },
  }),
});
