import type { Modify } from '@udecode/utils';

import { liftNodes as liftNodesBase } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../../interfaces';

import { getQueryOptions } from '../../utils';

export type LiftNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof liftNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const liftNodes = <E extends TEditor>(
  editor: E,
  options?: LiftNodesOptions<ValueOf<E>>
) => {
  return liftNodesBase(editor as any, getQueryOptions(editor, options));
};
