import type {
  Editor,
  EditorNodesOptions,
  ElementOf,
  NodeProps,
  ValueOf,
} from '../interfaces';

export const setBlockNodes = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  props: Partial<NodeProps<N>>,
  options?: EditorNodesOptions<ValueOf<E>>
) => {
  editor.tf.withoutNormalizing(() => {
    const blocks = editor.api.blocks(options);

    blocks.forEach(([, path]) => {
      editor.tf.setNodes<N>(props as any, {
        at: path,
      });
    });
  });
};
