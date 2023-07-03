import {
  ELEMENT_DEFAULT,
  createPluginFactory,
  getPluginType,
  mapInjectPropsToPlugin,
} from '@udecode/plate-common';

export const KEY_LINE_HEIGHT = 'lineHeight';

/**
 * Enables support for text alignment, useful to align your content
 * to left, right and center it.
 */
export const createLineHeightPlugin = createPluginFactory({
  key: KEY_LINE_HEIGHT,
  inject: {
    props: {
      nodeKey: KEY_LINE_HEIGHT,
      defaultNodeValue: 1.5,
    },
  },
  then: (editor) => ({
    inject: {
      props: {
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      },
    },
    then: (_, plugin) =>
      mapInjectPropsToPlugin(editor, plugin, {
        deserializeHtml: {
          getNode: (el, node) => {
            if (el.style.lineHeight) {
              node[plugin.key] = el.style.lineHeight;
            }
          },
        },
      }),
  }),
});
