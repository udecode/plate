import type { Modify } from '@udecode/utils';

import { removeNodes as removeNodesBase } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../../interfaces';

import { getQueryOptions } from '../../utils';

export type RemoveNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof removeNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const removeNodes = <E extends TEditor>(
  editor: E,
  options?: RemoveNodesOptions<ValueOf<E>>
) => {
  return removeNodesBase(editor as any, getQueryOptions(editor, options));
};
