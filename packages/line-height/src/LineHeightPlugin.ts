import {
  ParagraphPlugin,
  createPlugin,
  getPluginType,
} from '@udecode/plate-common';

/**
 * Enables support for text alignment, useful to align your content to left,
 * right and center it.
 */
export const LineHeightPlugin = createPlugin({
  inject: {
    props: {
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
      validPluginToInjectPlugin: ({ editor, plugin }) => ({
        deserializeHtml: {
          getNode: ({ element, node }) => {
            if (element.style.lineHeight) {
              node[getPluginType(editor, plugin)] = element.style.lineHeight;
            }
          },
        },
      }),
      validPlugins: [ParagraphPlugin.key],
    },
  },
  key: 'lineHeight',
});
