import { next } from 'slate';

import type { DescendantOf } from '../../interfaces';
import type { Editor, ValueOf } from '../../interfaces/editor/editor';
import type { GetNextNodeOptions } from '../../interfaces/editor/editor-types';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';

import { getQueryOptions } from '../../utils';

export const getNextNode = <
  N extends DescendantOf<E>,
  E extends Editor = Editor,
>(
  editor: E,
  options?: GetNextNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined => {
  return next(editor as any, getQueryOptions(editor, options)) as any;
};
