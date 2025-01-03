import { unwrapNodes as unwrapNodesBase } from 'slate';

import type { TEditor, ValueOf } from '../../interfaces';
import type { UnwrapNodesOptions } from '../../interfaces/editor/editor-types';

import { getQueryOptions } from '../../utils/match';

export const unwrapNodes = <E extends TEditor>(
  editor: E,
  options?: UnwrapNodesOptions<ValueOf<E>>
) => {
  unwrapNodesBase(editor as any, getQueryOptions(editor, options));
};
