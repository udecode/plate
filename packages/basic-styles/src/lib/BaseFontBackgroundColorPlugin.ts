import { createSlatePlugin, KEYS } from '@udecode/plate';

export const BaseFontBackgroundColorPlugin = createSlatePlugin({
  key: KEYS.backgroundColor,
  inject: {
    nodeProps: {
      nodeKey: 'backgroundColor',
    },
  },
  parsers: {
    html: {
      deserializer: {
        isLeaf: true,
        rules: [
          {
            validStyle: {
              backgroundColor: '*',
            },
          },
        ],
        parse: ({ element, type }) => ({
          [type]: element.style.backgroundColor,
        }),
      },
    },
  },
}).extendTransforms(({ editor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.backgroundColor]: value,
    });
  },
}));
