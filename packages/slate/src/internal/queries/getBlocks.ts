import type { GetNodeEntriesOptions } from '../../interfaces/editor/editor-types';
import type { ElementOf, Editor, ValueOf } from '../../interfaces/index';

export const getBlocks = <N extends ElementOf<E>, E extends Editor = Editor>(
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
