import { splitNodes as splitNodesBase } from 'slate';

import type { Editor, ValueOf } from '../../interfaces';
import type { SplitNodesOptions } from '../../interfaces/editor/editor-types';

import { getQueryOptions } from '../../utils';

export const splitNodes = <E extends Editor>(
  editor: E,
  options?: SplitNodesOptions<ValueOf<E>>
) => {
  return splitNodesBase(editor as any, getQueryOptions(editor, options));
};
