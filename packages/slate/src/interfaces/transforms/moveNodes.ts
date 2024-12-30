import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';

import { getQueryOptions } from '../../utils';

export type MoveNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.moveNodes>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const moveNodes = <E extends TEditor>(
  editor: E,
  options?: MoveNodesOptions<ValueOf<E>>
) => {
  return Transforms.moveNodes(editor as any, getQueryOptions(editor, options));
};
