import {
  createPluginFactory,
  ELEMENT_DEFAULT,
  getPluginType,
  mapInjectPropsToPlugin,
} from '@udecode/plate-common';

export const KEY_ALIGN = 'align';

/**
 * Creates a plugin that adds alignment functionality to the editor.
 */
export const createAlignPlugin = createPluginFactory({
  key: KEY_ALIGN,
  then: (editor) => ({
    inject: {
      props: {
        nodeKey: KEY_ALIGN,
        defaultNodeValue: 'start',
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      },
    },
    then: (_, plugin) =>
      mapInjectPropsToPlugin(editor, plugin, {
        deserializeHtml: {
          getNode: (el, node) => {
            if (el.style.textAlign) {
              node[plugin.key] = el.style.textAlign;
            }
          },
        },
      }),
  }),
});
