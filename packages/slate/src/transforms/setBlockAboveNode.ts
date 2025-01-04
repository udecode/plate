import type { ElementOf, TEditor, TNodeProps, ValueOf } from '../interfaces';
import type { SetNodesOptions } from '../interfaces/editor/editor-types';

export const setBlockAboveNode = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  props: Partial<TNodeProps<N>>,
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
  E extends TEditor = TEditor,
>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: Omit<SetNodesOptions<ValueOf<E>>, 'at'>
) => {
  setBlockAboveNode(editor, props, { ...options, mode: 'lowest' });
};
