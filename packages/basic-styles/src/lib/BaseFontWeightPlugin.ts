import { createSlatePlugin, KEYS } from 'platejs';

export const BaseFontWeightPlugin = createSlatePlugin({
  key: KEYS.fontWeight,
  inject: {
    nodeProps: {
      nodeKey: 'fontWeight',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              fontWeight: '*',
            },
          },
        ],
        parse: ({ element, type }: { element: HTMLElement; type: string }) => ({
          [type]: element.style.fontWeight,
        }),
      },
    },
  },
}).extendTx(({ plugin, type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(plugin.inject.nodeProps?.nodeKey ?? type, value);
  },
}));
