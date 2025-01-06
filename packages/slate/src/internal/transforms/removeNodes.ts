import { removeNodes as removeNodesBase } from 'slate';

import type { Editor, ValueOf } from '../../interfaces';
import type { RemoveNodesOptions } from '../../interfaces/editor/editor-types';

import { getQueryOptions } from '../../utils';

export const removeNodes = <E extends Editor>(
  editor: E,
  options?: RemoveNodesOptions<ValueOf<E>>
) => {
  return removeNodesBase(editor as any, getQueryOptions(editor, options));
};
