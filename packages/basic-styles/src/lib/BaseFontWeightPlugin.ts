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
        parse: ({ element, type }) => ({ [type]: element.style.fontWeight }),
      },
    },
  },
}).extendTransforms(({ editor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.fontWeight]: value,
    });
  },
}));
