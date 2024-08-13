import { getPluginType } from '@udecode/plate-common';
import { ParagraphPlugin, createPlugin } from '@udecode/plate-common';

/** Creates a plugin that adds alignment functionality to the editor. */
export const AlignPlugin = createPlugin({
  inject: {
    props: {
      defaultNodeValue: 'start',
      nodeKey: 'align',
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
      validPlugins: [ParagraphPlugin.key],
    },
  },
  key: 'align',
});
