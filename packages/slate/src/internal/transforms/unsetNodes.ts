import type { Modify } from '@udecode/utils';

import { unsetNodes as unsetNodesBase } from 'slate';

import type { TEditor, Value, ValueOf } from '../../interfaces';
import type { NodeOf, TNodeProps } from '../../interfaces/node/TNode';
import type {
  QueryMode,
  QueryOptions,
  QueryVoids,
} from '../../types/QueryOptions';

import { getQueryOptions } from '../../utils';

export type UnsetNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof unsetNodesBase>[2]>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const unsetNodes = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  props: (keyof TNodeProps<N>)[] | keyof TNodeProps<N>,
  options?: UnsetNodesOptions<ValueOf<E>>
) => {
  return unsetNodesBase(
    editor as any,
    props as any,
    getQueryOptions(editor, options)
  );
};
