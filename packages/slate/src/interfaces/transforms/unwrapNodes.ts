import type { Modify } from '@udecode/utils';

import { Transforms } from 'slate';

import type { QueryMode, QueryOptions, QueryVoids } from '../../types';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';

import { getQueryOptions } from '../../utils/match';

export type UnwrapNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.unwrapNodes>[1]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const unwrapNodes = <E extends TEditor>(
  editor: E,
  options?: UnwrapNodesOptions<ValueOf<E>>
) => {
  Transforms.unwrapNodes(editor as any, getQueryOptions(editor, options));
};
