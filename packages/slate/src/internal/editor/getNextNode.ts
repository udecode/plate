import { next } from 'slate';

import type { DescendantOf } from '../../interfaces';
import type { TEditor, ValueOf } from '../../interfaces/editor/TEditor';
import type { GetNextNodeOptions } from '../../interfaces/editor/editor-types';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getQueryOptions } from '../../utils';

export const getNextNode = <
  N extends DescendantOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetNextNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined => {
  return next(editor as any, getQueryOptions(editor, options)) as any;
};
