import {
  BaseParagraphPlugin,
  createSlatePlugin,
  isSlatePluginElement,
} from '@udecode/plate';

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
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element, node, type }) => {
              if (isSlatePluginElement(element, type)) {
                return { type };
              }
              if (element.style.lineHeight) {
                node[editor.getType(plugin)] = element.style.lineHeight;
              }
            },
          },
        },
      },
    }),
    targetPlugins: [BaseParagraphPlugin.key],
  },
});
