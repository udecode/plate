import { createSlatePlugin, KEYS } from 'platejs';

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
        parse({ element, type }) {
          if (element.style.color) {
            return { [type]: element.style.color };
          }
        },
      },
    },
  },
}).extendTransforms(({ editor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.color]: value,
    });
  },
}));
