import {
  type InsertNodesOptions,
  type TElement,
  type UnknownObject,
  createSlatePlugin,
} from '@udecode/plate';

export type TagLike = { value: string } & UnknownObject;

export type TTagElement = TElement & TagLike;

export const BaseTagPlugin = createSlatePlugin({
  key: 'tag',
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
  },
}).extendEditorTransforms(({ editor, type }) => ({
  insert: {
    tag: (props: TagLike, options?: InsertNodesOptions) => {
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
