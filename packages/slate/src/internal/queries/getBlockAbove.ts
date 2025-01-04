import type { GetAboveNodeOptions } from '../../interfaces/editor/editor-types';
import type { AncestorOf, TEditor, ValueOf } from '../../interfaces/index';

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
