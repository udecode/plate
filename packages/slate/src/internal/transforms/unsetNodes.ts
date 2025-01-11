import { unsetNodes as unsetNodesBase } from 'slate';

import type {
  DescendantOf,
  Editor,
  UnsetNodesOptions,
  ValueOf,
} from '../../interfaces';
import type { NodeProps } from '../../interfaces/node';

import { getQueryOptions } from '../../utils';

export const unsetNodes = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  props: (keyof NodeProps<N>)[] | keyof NodeProps<N>,
  options?: UnsetNodesOptions<ValueOf<E>>
) => {
  return unsetNodesBase(
    editor as any,
    props as any,
    getQueryOptions(editor, options)
  );
};
