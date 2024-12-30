import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';

import { getQueryOptions } from '../../utils';

export type LiftNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.liftNodes>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const liftNodes = <E extends TEditor>(
  editor: E,
  options?: LiftNodesOptions<ValueOf<E>>
) => {
  return Transforms.liftNodes(editor as any, getQueryOptions(editor, options));
};
