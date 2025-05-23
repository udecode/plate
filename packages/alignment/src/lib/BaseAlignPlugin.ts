import { BaseParagraphPlugin, createSlatePlugin, KEYS } from '@udecode/plate';

/** Creates a plugin that adds alignment functionality to the editor. */
export const BaseAlignPlugin = createSlatePlugin({
  key: KEYS.align,
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 'start',
      nodeKey: 'align',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
    targetPlugins: [BaseParagraphPlugin.key],
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element, node }) => {
              if (element.style.textAlign) {
                node[editor.getType(KEYS.align)] = element.style.textAlign;
              }
            },
          },
        },
      },
    }),
  },
});
