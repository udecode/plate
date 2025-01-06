import { unsetNodes as unsetNodesBase } from 'slate';

import type { DescendantOf, Editor, ValueOf } from '../../interfaces';
import type { UnsetNodesOptions } from '../../interfaces/editor/editor-types';
import type { TNodeProps } from '../../interfaces/node/TNode';

import { getQueryOptions } from '../../utils';

export const unsetNodes = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  props: (keyof TNodeProps<N>)[] | keyof TNodeProps<N>,
  options?: UnsetNodesOptions<ValueOf<E>>
) => {
  return unsetNodesBase(
    editor as any,
    props as any,
    getQueryOptions(editor, options)
  );
};
