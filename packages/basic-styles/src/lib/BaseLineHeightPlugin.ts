import {
  type SlateEditor,
  createSlatePlugin,
  getInjectMatch,
  KEYS,
} from 'platejs';

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
    targetPluginToInject: ({
      editor,
      plugin,
    }: {
      editor: SlateEditor;
      plugin: { key: string };
    }) => ({
      parsers: {
        html: {
          deserializer: {
            parse: ({ element }: { element: HTMLElement }) => {
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
}).extendTx(({ plugin, type }) => (tx, editor) => ({
  set: (value: number, options?: unknown) => {
    const defaultValue =
      (plugin.inject.nodeProps?.defaultNodeValue as number | undefined) ?? 1.5;
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
