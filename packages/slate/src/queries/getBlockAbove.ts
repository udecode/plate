import {
  type AncestorOf,
  type GetAboveNodeOptions,
  type TEditor,
  type ValueOf,
  getAboveNode,
} from '../interfaces';

/** Get the block above a location (default: selection). */
export const getBlockAbove = <
  N extends AncestorOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options: GetAboveNodeOptions<ValueOf<E>> = {}
) =>
  getAboveNode<N, E>(editor, {
    ...options,
    block: true,
  });
