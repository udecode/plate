import { BaseParagraphPlugin, createSlatePlugin } from '@udecode/plate';

/**
 * Enables support for text alignment, useful to align your content to left,
 * right and center it.
 */
export const BaseLineHeightPlugin = createSlatePlugin({
  key: 'lineHeight',
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    },
    targetPlugins: [BaseParagraphPlugin.key],
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element }) => {
              if (element.style.lineHeight) {
                return {
                  [editor.getType(plugin)]: element.style.lineHeight,
                };
              }
            },
          },
        },
      },
    }),
  },
});
