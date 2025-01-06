import { setNodes as setNodesBase } from 'slate';

import type { DescendantOf, Editor, ValueOf } from '../../interfaces';
import type { SetNodesOptions } from '../../interfaces/editor/editor-types';
import type { TNodeProps } from '../../interfaces/node/TNode';

import { getQueryOptions } from '../../utils';

export const setNodes = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: SetNodesOptions<ValueOf<E>>
) => {
  return setNodesBase(
    editor as any,
    props as any,
    getQueryOptions(editor, options)
  );
};
