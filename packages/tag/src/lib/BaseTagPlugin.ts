import { type TTagProps, createSlatePlugin, KEYS } from 'platejs';

export const BaseTagPlugin = createSlatePlugin({
  key: KEYS.tag,
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
  },
}).extendEditorTransforms(({ editor, type }) => ({
  insert: {
    tag: (props: TTagProps, options?: any) => {
      editor.tf.insertNodes(
        [
          {
            children: [{ text: '' }],
            type,
            ...props,
          },
          { text: '' },
        ],
        options
      );
    },
  },
}));
