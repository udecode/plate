import type { Modify } from '@udecode/utils';

import { splitNodes as splitNodesBase } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../../interfaces';

import { getQueryOptions } from '../../utils';

export type SplitNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof splitNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const splitNodes = <E extends TEditor>(
  editor: E,
  options?: SplitNodesOptions<ValueOf<E>>
) => {
  return splitNodesBase(editor as any, getQueryOptions(editor, options));
};
