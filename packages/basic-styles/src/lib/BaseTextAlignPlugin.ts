import {
  type SlateEditor,
  createSlatePlugin,
  getInjectMatch,
  KEYS,
} from 'platejs';

export type Alignment =
  | 'center'
  | 'end'
  | 'justify'
  | 'left'
  | 'right'
  | 'start';

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
}).extendTx(({ plugin, type }) => (tx, editor) => ({
  set: (value: Alignment, options?: unknown) => {
    const defaultValue =
      (plugin.inject.nodeProps?.defaultNodeValue as Alignment | undefined) ??
      'start';
    const nodeKey = plugin.inject.nodeProps?.nodeKey ?? type;
    const nextOptions = {
      match: getInjectMatch(editor, plugin),
      ...((options ?? {}) as Record<string, unknown>),
    };

    if (Object.is(value, defaultValue)) {
      tx.nodes.unset(nodeKey, nextOptions);

      return;
    }

    tx.nodes.set({ [nodeKey]: value }, nextOptions);
  },
}));
