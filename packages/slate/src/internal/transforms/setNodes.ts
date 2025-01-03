import { setNodes as setNodesBase } from 'slate';

import type { DescendantOf, TEditor, ValueOf } from '../../interfaces';
import type { SetNodesOptions } from '../../interfaces/editor/editor-types';
import type { TNodeProps } from '../../interfaces/node/TNode';

import { getQueryOptions } from '../../utils';

export const setNodes = <
  N extends DescendantOf<E>,
  E extends TEditor = TEditor,
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
