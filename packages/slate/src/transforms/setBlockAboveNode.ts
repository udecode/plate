import type {
  Editor,
  ElementOf,
  NodeProps,
  SetNodesOptions,
  ValueOf,
} from '../interfaces';

export const setBlockAboveNode = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  props: Partial<NodeProps<N>>,
  options?: Omit<SetNodesOptions<ValueOf<E>>, 'at'>
) => {
  const at = editor.api.block()?.[1];

  if (!at) return;

  editor.tf.setNodes(props, {
    ...options,
    at: editor.api.block()![1],
  } as any);
};

export const setBlockAboveTexts = <
  N extends ElementOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  props: Partial<NodeProps<N>>,
  options?: Omit<SetNodesOptions<ValueOf<E>>, 'at'>
) => {
  setBlockAboveNode(editor, props, { ...options, mode: 'lowest' });
};
