import { above } from 'slate';

import type { QueryMode, QueryOptions, QueryVoids } from '../../types';
import type { AncestorOf } from '../node/TAncestor';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value, ValueOf } from './TEditor';

import { getQueryOptions } from '../../utils/match';

export type GetAboveNodeOptions<V extends Value = Value> = QueryOptions<V> &
  QueryMode &
  QueryVoids;

export const getAboveNode = <
  N extends AncestorOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetAboveNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined => {
  return above(editor as any, getQueryOptions(editor, options)) as any;
};
