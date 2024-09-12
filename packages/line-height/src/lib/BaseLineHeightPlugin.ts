import { ParagraphPlugin, createSlatePlugin } from '@udecode/plate-common';

/**
 * Enables support for text alignment, useful to align your content to left,
 * right and center it.
 */
export const BaseLineHeightPlugin = createSlatePlugin({
  inject: {
    nodeProps: {
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    },
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element, node }) => {
              if (element.style.lineHeight) {
                node[editor.getType(plugin)] = element.style.lineHeight;
              }
            },
          },
        },
      },
    }),
    targetPlugins: [ParagraphPlugin.key],
  },
  key: 'lineHeight',
});
