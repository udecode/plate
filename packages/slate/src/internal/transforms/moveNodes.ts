import { moveNodes as moveNodesBase } from 'slate';

import type { TEditor, ValueOf } from '../../interfaces';
import type { MoveNodesOptions } from '../../interfaces/editor/editor-types';

import { getQueryOptions } from '../../utils';

export const moveNodes = <E extends TEditor>(
  editor: E,
  options?: MoveNodesOptions<ValueOf<E>>
) => {
  return moveNodesBase(editor as any, getQueryOptions(editor, options));
};
