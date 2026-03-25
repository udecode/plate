import { type SlateEditor, createSlatePlugin, KEYS } from 'platejs';

export const BaseFontSizePlugin = createSlatePlugin({
  key: KEYS.fontSize,
  inject: {
    nodeProps: {
      nodeKey: 'fontSize',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              fontSize: '*',
            },
          },
        ],
        parse: ({ element, type }: { element: HTMLElement; type: string }) => ({
          [type]: element.style.fontSize,
        }),
      },
    },
  },
}).extendTransforms(({ editor }: { editor: SlateEditor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.fontSize]: value,
    });
  },
}));
