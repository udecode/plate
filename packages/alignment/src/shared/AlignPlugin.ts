import { ParagraphPlugin, createPlugin } from '@udecode/plate-common';

/** Creates a plugin that adds alignment functionality to the editor. */
export const AlignPlugin = createPlugin({
  inject: {
    props: {
      defaultNodeValue: 'start',
      nodeKey: 'align',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
    targetPluginToInject: ({ editor, plugin }) => ({
      deserializeHtml: {
        getNode: ({ element, node }) => {
          if (element.style.textAlign) {
            node[editor.getType(plugin)] = element.style.textAlign;
          }
        },
      },
    }),
    targetPlugins: [ParagraphPlugin.key],
  },
  key: 'align',
});
