import { getPluginType } from '@udecode/plate-common';
import { ELEMENT_DEFAULT, createPlugin } from '@udecode/plate-common/server';

export const KEY_ALIGN = 'align';

/** Creates a plugin that adds alignment functionality to the editor. */
export const AlignPlugin = createPlugin({
  inject: {
    props: {
      defaultNodeValue: 'start',
      nodeKey: KEY_ALIGN,
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
      validPluginToInjectPlugin: ({ editor, plugin }) => ({
        deserializeHtml: {
          getNode: ({ element, node }) => {
            if (element.style.textAlign) {
              node[getPluginType(editor, plugin)] = element.style.textAlign;
            }
          },
        },
      }),
      validPlugins: [ELEMENT_DEFAULT],
    },
  },
  key: KEY_ALIGN,
});
