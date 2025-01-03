import type { Modify } from '@udecode/utils';

import { type EditorLevelsOptions, levels } from 'slate';

import type { QueryOptions, QueryVoids } from '../../types';
import type { NodeOf, TNode } from '../../interfaces/node/TNode';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';
import type { TEditor, Value, ValueOf } from '../../interfaces/editor/TEditor';

import { getQueryOptions } from '../../utils';

export type GetLevelsOptions<V extends Value = Value> = Modify<
  NonNullable<EditorLevelsOptions<TNode>>,
  QueryOptions<V> & QueryVoids
>;

export const getLevels = <N extends NodeOf<E>, E extends TEditor = TEditor>(
  editor: E,
  options?: GetLevelsOptions<ValueOf<E>>
): Generator<TNodeEntry<N>, void, undefined> => {
  return levels(editor as any, getQueryOptions(editor, options)) as any;
};
