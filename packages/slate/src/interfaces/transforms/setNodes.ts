import type { Modify } from '@udecode/utils';

import { setNodes as setNodesBase } from 'slate';

import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';
import type { TEditor, Value, ValueOf } from '../editor/TEditor';
import type { NodeOf, TNodeProps } from '../node/TNode';

import { getQueryOptions } from '../../utils';

export type SetNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof setNodesBase>[2]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const setNodes = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  props: Partial<TNodeProps<N>>,
  options?: SetNodesOptions<ValueOf<E>>
) => {
  return setNodesBase(
    editor as any,
    props as any,
    getQueryOptions(editor, options)
  );
};
