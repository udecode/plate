import { splitNodes as splitNodesBase } from 'slate';

import type { TEditor, ValueOf } from '../../interfaces';
import type { SplitNodesOptions } from '../../interfaces/editor/editor-types';

import { getQueryOptions } from '../../utils';

export const splitNodes = <E extends TEditor>(
  editor: E,
  options?: SplitNodesOptions<ValueOf<E>>
) => {
  return splitNodesBase(editor as any, getQueryOptions(editor, options));
};
