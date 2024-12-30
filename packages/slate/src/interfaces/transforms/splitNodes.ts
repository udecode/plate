import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';

import { getQueryOptions } from '../../utils';

export type SplitNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.splitNodes>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const splitNodes = <E extends TEditor>(
  editor: E,
  options?: SplitNodesOptions<ValueOf<E>>
) => {
  return Transforms.splitNodes(editor as any, getQueryOptions(editor, options));
};
