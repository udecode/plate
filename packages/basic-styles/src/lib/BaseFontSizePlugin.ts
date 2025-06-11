import { createSlatePlugin, KEYS } from 'platejs';

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
        parse: ({ element, type }) => ({ [type]: element.style.fontSize }),
      },
    },
  },
}).extendTransforms(({ editor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.fontSize]: value,
    });
  },
}));
