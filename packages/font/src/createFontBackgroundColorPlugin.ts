import { createPluginFactory } from '@udecode/plate-common/server';

export const MARK_BG_COLOR = 'backgroundColor';

export const createFontBackgroundColorPlugin = createPluginFactory({
  inject: {
    props: {
      nodeKey: MARK_BG_COLOR,
    },
  },
  key: MARK_BG_COLOR,
  then: (editor, { type }) => ({
    deserializeHtml: {
      getNode: (element) => ({ [type]: element.style.backgroundColor }),
      isLeaf: true,
      rules: [
        {
          validStyle: {
            backgroundColor: '*',
          },
        },
      ],
    },
  }),
});
