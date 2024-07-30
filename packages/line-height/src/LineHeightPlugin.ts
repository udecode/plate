import {
  ELEMENT_DEFAULT,
  createPlugin,
  getPluginType,
  mapInjectPropsToPlugin,
} from '@udecode/plate-common/server';

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
    },
  },
  key: KEY_LINE_HEIGHT,
})
  .extend((editor) => ({
    inject: {
      props: {
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      },
    },
  }))
  .extend((editor, plugin) =>
    mapInjectPropsToPlugin(editor, plugin, {
      deserializeHtml: {
        getNode: (el, node) => {
          if (el.style.lineHeight) {
            node[plugin.key] = el.style.lineHeight;
          }
        },
      },
    })
  );
