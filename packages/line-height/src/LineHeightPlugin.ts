import { getPluginType } from '@udecode/plate-common';
import { ELEMENT_DEFAULT, createPlugin } from '@udecode/plate-common';

export const KEY_LINE_HEIGHT = 'lineHeight';

/**
 * Enables support for text alignment, useful to align your content to left,
 * right and center it.
 */
export const LineHeightPlugin = createPlugin({
  inject: {
    props: {
      defaultNodeValue: 1.5,
      nodeKey: KEY_LINE_HEIGHT,
      validPluginToInjectPlugin: ({ editor, plugin }) => ({
        deserializeHtml: {
          getNode: ({ element, node }) => {
            if (element.style.lineHeight) {
              node[getPluginType(editor, plugin)] = element.style.lineHeight;
            }
          },
        },
      }),
      validPlugins: [ELEMENT_DEFAULT],
    },
  },
  key: KEY_LINE_HEIGHT,
});
