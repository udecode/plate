import {
  ELEMENT_DEFAULT,
  createPluginFactory,
  getPluginType,
  mapInjectPropsToPlugin,
} from '@udecode/plate-common/server';

export const KEY_LINE_HEIGHT = 'lineHeight';

/**
 * Enables support for text alignment, useful to align your content to left,
 * right and center it.
 */
export const createLineHeightPlugin = createPluginFactory({
  inject: {
    props: {
      defaultNodeValue: 1.5,
      nodeKey: KEY_LINE_HEIGHT,
    },
  },
  key: KEY_LINE_HEIGHT,
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
