import type { Modify } from '@udecode/utils';

import { type EditorPreviousOptions, previous } from 'slate';

import type { QueryMode, QueryOptions, QueryVoids } from '../../types';
import type { NodeOf, TNode } from '../../interfaces/node/TNode';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';
import type { TEditor, Value, ValueOf } from '../../interfaces/editor/TEditor';

import { getQueryOptions } from '../../utils';

export type GetPreviousNodeOptions<V extends Value = Value> = Modify<
  NonNullable<EditorPreviousOptions<TNode>>,
  QueryOptions<V> & QueryMode & QueryVoids
>;

export const getPreviousNode = <
  N extends NodeOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetPreviousNodeOptions<ValueOf<E>>
): TNodeEntry<N> | undefined =>
  previous(editor as any, getQueryOptions(editor, options)) as any;
