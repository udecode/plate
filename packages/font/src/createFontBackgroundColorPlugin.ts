import { createPluginFactory } from '@udecode/plate-common/server';

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
      isLeaf: true,
      getNode: (element) => ({ [type]: element.style.backgroundColor }),
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
