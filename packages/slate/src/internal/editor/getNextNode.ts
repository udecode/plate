import type { Modify } from '@udecode/utils';

import { type EditorNextOptions, next } from 'slate';

import type { QueryMode, QueryOptions, QueryVoids } from '../../types';
import type { TDescendant } from '../../interfaces/node';
import type { NodeOf } from '../../interfaces/node/TNode';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';
import type { TEditor, Value, ValueOf } from '../../interfaces/editor/TEditor';

import { getQueryOptions } from '../../utils';

export type GetNextNodeOptions<V extends Value = Value> = Modify<
  NonNullable<EditorNextOptions<TDescendant>>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const getNextNode = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetNextNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined => {
  return next(editor as any, getQueryOptions(editor, options)) as any;
};
