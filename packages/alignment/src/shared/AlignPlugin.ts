import {
  ELEMENT_DEFAULT,
  createPlugin,
  getPluginType,
  mapInjectPropsToPlugin,
} from '@udecode/plate-common/server';

export const KEY_ALIGN = 'align';

/** Creates a plugin that adds alignment functionality to the editor. */
export const AlignPlugin = createPlugin({
  key: KEY_ALIGN,
})
  .extend((editor) => ({
    inject: {
      props: {
        defaultNodeValue: 'start',
        nodeKey: KEY_ALIGN,
        styleKey: 'textAlign',
        validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
        validTypes: [getPluginType(editor, ELEMENT_DEFAULT)],
      },
    },
  }))
  .extend((editor, plugin) =>
    mapInjectPropsToPlugin(editor, plugin, {
      deserializeHtml: {
        getNode: (el, node) => {
          if (el.style.textAlign) {
            node[plugin.key] = el.style.textAlign;
          }
        },
      },
    })
  );
