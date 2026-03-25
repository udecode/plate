import {
  type SetNodesOptions,
  type SlateEditor,
  createSlatePlugin,
  KEYS,
} from 'platejs';

import { type Alignment, setAlign } from './transforms';

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
    targetPluginToInject: ({ editor }: { editor: SlateEditor }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({
              element,
              node,
            }: {
              element: HTMLElement;
              node: Record<string, unknown>;
            }) => {
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
}).extendTransforms(({ editor }: { editor: SlateEditor }) => ({
  setNodes: (value: Alignment, options?: SetNodesOptions) =>
    setAlign(editor, value, options),
}));
