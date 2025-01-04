import type { AncestorOf, TEditor, ValueOf } from '../interfaces';
import type { GetAboveNodeOptions } from '../interfaces/editor/editor-types';

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
