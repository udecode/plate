import { moveNodes as moveNodesBase } from 'slate';

import type { Editor, MoveNodesOptions, ValueOf } from '../../interfaces';

import { getQueryOptions } from '../../utils';

export const moveNodes = <E extends Editor>(
  editor: E,
  options?: MoveNodesOptions<ValueOf<E>>
) => {
  return moveNodesBase(editor as any, getQueryOptions(editor, options));
};
