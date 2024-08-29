import type { Modify } from '@udecode/utils';

import { Editor, type EditorNodesOptions } from 'slate';

import type { NodeOf, TNode } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor } from './TEditor';

import { type ENodeMatchOptions, getQueryOptions } from '../../utils/match';
import { type UnhangRangeOptions, unhangRange } from './unhangRange';

export type GetNodeEntriesOptions<E extends TEditor = TEditor> = Modify<
  NonNullable<EditorNodesOptions<TNode>>,
  ENodeMatchOptions<E>
> &
  UnhangRangeOptions;

/** Iterate through all of the nodes in the Editor. */
export const getNodeEntries = <
  N extends NodeOf<E>,
  E extends TEditor = TEditor,
>(
  editor: E,
  options?: GetNodeEntriesOptions<E>
): Generator<TNodeEntry<N>, void, undefined> => {
  unhangRange(editor, options?.at, options);

  return Editor.nodes(editor as any, getQueryOptions(editor, options)) as any;
};
