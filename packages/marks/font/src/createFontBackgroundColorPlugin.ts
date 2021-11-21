import { createPluginFactory } from '@udecode/plate-core';

export const MARK_BG_COLOR = 'backgroundColor';

export const createFontBackgroundColorPlugin = createPluginFactory({
  key: MARK_BG_COLOR,
  inject: {
    props: {
      nodeKey: MARK_BG_COLOR,
    },
  },
  then: (editor, { type }) => ({
    deserializeHtml: {
      getNode: (element) => ({ [type]: element.style.backgroundColor }),

      validStyle: {
        backgroundColor: '*',
      },
    },
  }),
});
