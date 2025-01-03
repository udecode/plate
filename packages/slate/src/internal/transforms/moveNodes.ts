import type { Modify } from '@udecode/utils';

import { moveNodes as moveNodesBase } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../../interfaces';

import { getQueryOptions } from '../../utils';

export type MoveNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof moveNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const moveNodes = <E extends TEditor>(
  editor: E,
  options?: MoveNodesOptions<ValueOf<E>>
) => {
  return moveNodesBase(editor as any, getQueryOptions(editor, options));
};
