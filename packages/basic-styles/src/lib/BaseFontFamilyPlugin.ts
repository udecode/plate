import { createSlatePlugin, KEYS } from 'platejs';

export const BaseFontFamilyPlugin = createSlatePlugin({
  key: KEYS.fontFamily,
  inject: {
    nodeProps: {
      nodeKey: 'fontFamily',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              fontFamily: '*',
            },
          },
        ],
        parse: ({ element, type }: { element: HTMLElement; type: string }) => ({
          [type]: element.style.fontFamily,
        }),
      },
    },
  },
}).extendTx(({ plugin, type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(plugin.inject.nodeProps?.nodeKey ?? type, value);
  },
}));
