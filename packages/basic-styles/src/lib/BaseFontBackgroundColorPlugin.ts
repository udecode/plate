import { createSlatePlugin, KEYS } from 'platejs';

export const BaseFontBackgroundColorPlugin = createSlatePlugin({
  key: KEYS.backgroundColor,
  inject: {
    nodeProps: {
      nodeKey: 'backgroundColor',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              backgroundColor: '*',
            },
          },
        ],
        parse: ({ element, type }: { element: HTMLElement; type: string }) => ({
          [type]: element.style.backgroundColor,
        }),
      },
    },
  },
}).extendTx(({ plugin, type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(plugin.inject.nodeProps?.nodeKey ?? type, value);
  },
}));
