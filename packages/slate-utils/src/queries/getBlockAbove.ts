import {
  type AncestorOf,
  type GetAboveNodeOptions,
  type TEditor,
  getAboveNode,
} from '@udecode/slate';

/** Get the block above a location (default: selection). */
export const getBlockAbove = <
  N extends AncestorOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options: GetAboveNodeOptions<E> = {}
) =>
  getAboveNode<N, E>(editor, {
    ...options,
    block: true,
  });
