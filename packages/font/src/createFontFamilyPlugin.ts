import { AnyObject, createPluginFactory } from '@udecode/plate-common';

export const MARK_FONT_FAMILY = 'fontFamily';

export const createFontFamilyPlugin = createPluginFactory<AnyObject>({
  key: MARK_FONT_FAMILY,
  inject: {
    props: {
      nodeKey: MARK_FONT_FAMILY,
    },
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      isLeaf: true,
      getNode: (element) => ({ [type]: element.style.fontFamily }),
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
