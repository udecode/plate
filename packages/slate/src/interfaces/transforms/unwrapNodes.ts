import type { Modify } from '@udecode/utils';

import { unwrapNodes as unwrapNodesBase } from 'slate';

import type { QueryMode, QueryOptions, QueryVoids } from '../../types';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';

import { getQueryOptions } from '../../utils/match';

export type UnwrapNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof unwrapNodesBase>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const unwrapNodes = <E extends TEditor>(
  editor: E,
  options?: UnwrapNodesOptions<ValueOf<E>>
) => {
  unwrapNodesBase(editor as any, getQueryOptions(editor, options));
};
