import { removeNodes as removeNodesBase } from 'slate';

import type { TEditor, ValueOf } from '../../interfaces';
import type { RemoveNodesOptions } from '../../interfaces/editor/editor-types';

import { getQueryOptions } from '../../utils';

export const removeNodes = <E extends TEditor>(
  editor: E,
  options?: RemoveNodesOptions<ValueOf<E>>
) => {
  return removeNodesBase(editor as any, getQueryOptions(editor, options));
};
