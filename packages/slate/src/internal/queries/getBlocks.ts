import type { GetNodeEntriesOptions } from '../../interfaces/editor/editor-types';
import type { ElementOf, TEditor, ValueOf } from '../../interfaces/index';

export const getBlocks = <N extends ElementOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetNodeEntriesOptions<ValueOf<E>>
) => {
  return [
    ...editor.api.nodes<N>({
      ...options,
      block: true,
    }),
  ];
};
