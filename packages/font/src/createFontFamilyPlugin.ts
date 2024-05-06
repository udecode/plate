import { createPluginFactory } from '@udecode/plate-common/server';

export const MARK_FONT_FAMILY = 'fontFamily';

export const createFontFamilyPlugin = createPluginFactory({
  inject: {
    props: {
      nodeKey: MARK_FONT_FAMILY,
    },
  },
  key: MARK_FONT_FAMILY,
  then: (editor, { type }) => ({
    deserializeHtml: {
      getNode: (element) => ({ [type]: element.style.fontFamily }),
      isLeaf: true,
      rules: [
        {
          validStyle: {
            fontFamily: '*',
          },
        },
      ],
    },
  }),
});
