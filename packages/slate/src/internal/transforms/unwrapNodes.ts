import { unwrapNodes as unwrapNodesBase } from 'slate';

import type { Editor, UnwrapNodesOptions, ValueOf } from '../../interfaces';

import { getQueryOptions } from '../../utils/match';

export const unwrapNodes = <E extends Editor>(
  editor: E,
  options?: UnwrapNodesOptions<ValueOf<E>>
) => {
  unwrapNodesBase(editor as any, getQueryOptions(editor, options));
};
