import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';

import { getQueryOptions } from '../../utils';

export type RemoveNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.removeNodes>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const removeNodes = <E extends TEditor>(
  editor: E,
  options?: RemoveNodesOptions<ValueOf<E>>
) => {
  return Transforms.removeNodes(
    editor as any,
    getQueryOptions(editor, options)
  );
};
