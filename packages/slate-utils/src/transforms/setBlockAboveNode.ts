import type {
  ElementOf,
  SetNodesOptions,
  TEditor,
  TNodeProps,
} from '@udecode/slate';

import { getBlockAbove } from '../queries';

export const setBlockAboveNode = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: Omit<SetNodesOptions<E>, 'at'>
) => {
  const at = getBlockAbove(editor)?.[1];

  if (!at) return;

  editor.setNodes(props, {
    ...options,
    at: getBlockAbove(editor)![1],
  } as any);
};

export const setBlockAboveTexts = <
  N extends ElementOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: Omit<SetNodesOptions<E>, 'at'>
) => {
  setBlockAboveNode(editor, props, { ...options, mode: 'lowest' });
};
