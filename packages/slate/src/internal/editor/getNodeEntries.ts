import type { Modify } from '@udecode/utils';

import { type EditorNodesOptions, type Span, nodes } from 'slate';

import type { At, QueryMode, QueryOptions } from '../../types';
import type { NodeOf, TNode } from '../../interfaces/node/TNode';
import type { TNodeEntry } from '../../interfaces/node/TNodeEntry';
import type { TEditor, Value, ValueOf } from '../../interfaces/editor/TEditor';

import { getQueryOptions } from '../../utils/match';

export type GetNodeEntriesOptions<V extends Value = Value> = Modify<
  NonNullable<EditorNodesOptions<TNode>>,
  Omit<QueryOptions<V>, 'at'> &
    QueryMode & {
      /** Where to start at. @default editor.selection */
      at?: At | Span;
    }
>;

export const getNodeEntries = <
  N extends NodeOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetNodeEntriesOptions<ValueOf<E>>
): Generator<TNodeEntry<N>, void, undefined> => {
  options = getQueryOptions(editor, options);

  // if (options?.at) {
  //   unhangRange(editor, options.at as any, options);
  // }

  return nodes(editor as any, options as any) as any;
};
