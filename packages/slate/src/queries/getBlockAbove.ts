import type {
  AncestorOf,
  GetAboveNodeOptions,
  TEditor,
  ValueOf,
} from '../interfaces';

/** Get the block above a location (default: selection). */
export const getBlockAbove = <
  N extends AncestorOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options: GetAboveNodeOptions<ValueOf<E>> = {}
) =>
  editor.api.above<N>({
    ...options,
    block: true,
  });
