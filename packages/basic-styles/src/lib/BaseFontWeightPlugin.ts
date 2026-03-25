import { type SlateEditor, createSlatePlugin, KEYS } from 'platejs';

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
}).extendTransforms(({ editor }: { editor: SlateEditor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.fontWeight]: value,
    });
  },
}));
