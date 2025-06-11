import { bindFirst, createSlatePlugin, KEYS } from 'platejs';

import { setAlign } from './transforms';

/** Creates a plugin that adds alignment functionality to the editor. */
export const BaseTextAlignPlugin = createSlatePlugin({
  key: KEYS.textAlign,
  inject: {
    isBlock: true,
    nodeProps: {
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    },
    targetPlugins: [KEYS.p],
    targetPluginToInject: ({ editor }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element, node }) => {
              if (element.style.textAlign) {
                node[editor.getType(KEYS.textAlign)] = element.style.textAlign;
              }
            },
          },
        },
      },
    }),
  },
  node: { type: 'align' },
}).extendTransforms(({ editor }) => ({
  setNodes: bindFirst(setAlign, editor),
}));
