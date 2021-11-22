import { createPluginFactory } from '@udecode/plate-core';

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
      getNode: (element) => ({ [type]: element.style.fontWeight }),

      validStyle: {
        fontWeight: '*',
      },
    },
  }),
});
