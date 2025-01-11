import { splitNodes as splitNodesBase } from 'slate';

import type { Editor, SplitNodesOptions, ValueOf } from '../../interfaces';

import { getQueryOptions } from '../../utils';

export const splitNodes = <E extends Editor>(
  editor: E,
  options?: SplitNodesOptions<ValueOf<E>>
) => {
  return splitNodesBase(editor as any, getQueryOptions(editor, options));
};
