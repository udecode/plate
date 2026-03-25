import { type SlateEditor, createSlatePlugin, KEYS } from 'platejs';

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
}).extendTransforms(({ editor }: { editor: SlateEditor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.fontFamily]: value,
    });
  },
}));
