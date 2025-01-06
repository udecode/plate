import { setNodes as setNodesBase } from 'slate';

import type {
  DescendantOf,
  Editor,
  SetNodesOptions,
  ValueOf,
} from '../../interfaces';
import type { NodeProps } from '../../interfaces/node';

import { getQueryOptions } from '../../utils';

export const setNodes = <N extends DescendantOf<E>, E extends Editor = Editor>(
  editor: E,
  props: Partial<NodeProps<N>>,
  options?: SetNodesOptions<ValueOf<E>>
) => {
  return setNodesBase(
    editor as any,
    props as any,
    getQueryOptions(editor, options)
  );
};
