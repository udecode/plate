import type { Modify } from '@udecode/utils';

import { type EditorNextOptions, next } from 'slate';

import type { QueryMode, QueryOptions, QueryVoids } from '../../types';
import type { TDescendant } from '../node';
import type { NodeOf } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value, ValueOf } from './TEditor';

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
