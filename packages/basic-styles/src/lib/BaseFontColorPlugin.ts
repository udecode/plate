import { type SlateEditor, createSlatePlugin, KEYS } from 'platejs';

export const BaseFontColorPlugin = createSlatePlugin({
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
}).extendTransforms(({ editor }: { editor: SlateEditor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.color]: value,
    });
  },
}));
