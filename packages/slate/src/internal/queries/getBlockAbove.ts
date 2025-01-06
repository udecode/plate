import type { GetAboveNodeOptions } from '../../interfaces/editor/editor-types';
import type { AncestorOf, Editor, ValueOf } from '../../interfaces/index';

export const getBlockAbove = <
  N extends AncestorOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options: GetAboveNodeOptions<ValueOf<E>> = {}
) =>
  editor.api.above<N>({
    ...options,
    block: true,
  });
