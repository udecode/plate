import { createSlatePlugin, KEYS } from '@udecode/plate';

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
        parse: ({ element, type }) => ({ [type]: element.style.fontFamily }),
      },
    },
  },
}).extendTransforms(({ editor }) => ({
  addMark: (value: string) => {
    editor.tf.addMarks({
      [KEYS.fontFamily]: value,
    });
  },
}));
