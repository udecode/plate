import { createPluginFactory } from '@udecode/plate-common/server';

export const MARK_FONT_WEIGHT = 'fontWeight';

export const createFontWeightPlugin = createPluginFactory({
  inject: {
    props: {
      nodeKey: MARK_FONT_WEIGHT,
    },
  },
  key: MARK_FONT_WEIGHT,
  then: (editor, { type }) => ({
    deserializeHtml: {
      getNode: (element) => ({ [type]: element.style.fontWeight }),
      isLeaf: true,
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
