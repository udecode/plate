import { bindFirst, createSlatePlugin, KEYS } from 'platejs';

import { setLineHeight } from './transforms';

/**
 * Enables support for text alignment, useful to align your content to left,
 * right and center it.
 */
export const BaseLineHeightPlugin = createSlatePlugin({
  key: KEYS.lineHeight,
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    },
    targetPlugins: [KEYS.p],
    targetPluginToInject: ({ editor, plugin }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element }) => {
              if (element.style.lineHeight) {
                return {
                  [editor.getType(plugin.key)]: element.style.lineHeight,
                };
              }
            },
          },
        },
      },
    }),
  },
}).extendTransforms(({ editor }) => ({
  setNodes: bindFirst(setLineHeight, editor),
}));
