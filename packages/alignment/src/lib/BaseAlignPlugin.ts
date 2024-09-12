import { BaseParagraphPlugin, createSlatePlugin } from '@udecode/plate-common';

/** Creates a plugin that adds alignment functionality to the editor. */
export const BaseAlignPlugin = createSlatePlugin({
  inject: {
    nodeProps: {
      defaultNodeValue: 'start',
      nodeKey: 'align',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element, node }) => {
              if (element.style.textAlign) {
                node[editor.getType(plugin)] = element.style.textAlign;
              }
            },
          },
        },
      },
    }),
    targetPlugins: [BaseParagraphPlugin.key],
  },
  key: 'align',
});
