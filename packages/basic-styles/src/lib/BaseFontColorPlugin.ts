import { createEditorPlugin, KEYS } from 'platejs';

export const BaseFontColorPlugin = createEditorPlugin({
  key: KEYS.color,
  inject: {
    nodeProps: {
      defaultNodeValue: 'black',
      nodeKey: 'color',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              color: '*',
            },
          },
        ],
        parse({ element, type }: { element: HTMLElement; type: string }) {
          if (element.style.color) {
            return { [type]: element.style.color };
          }
        },
      },
    },
  },
}).extendTx(({ plugin, type }) => (tx) => ({
  set: (value: string) => {
    tx.marks.add(plugin.inject.nodeProps?.nodeKey ?? type, value);
  },
}));
