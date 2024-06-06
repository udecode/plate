import type { Modify } from '@udecode/utils';

import { Editor, type EditorNodesOptions } from 'slate';

import type { ENode, TNode } from '../node/TNode';
import type { TNodeEntry } from '../node/TNodeEntry';
import type { TEditor, Value } from './TEditor';

import { type ENodeMatchOptions, getQueryOptions } from '../../utils/match';
import { type UnhangRangeOptions, unhangRange } from './unhangRange';

export type GetNodeEntriesOptions<V extends Value = Value> = Modify<
  NonNullable<EditorNodesOptions<TNode>>,
  ENodeMatchOptions<V>
> &
  UnhangRangeOptions;

/** Iterate through all of the nodes in the Editor. */
export const getNodeEntries = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: GetNodeEntriesOptions<V>
): Generator<TNodeEntry<N>, void, undefined> => {
  unhangRange(editor, options?.at, options);

  return Editor.nodes(editor as any, getQueryOptions(editor, options)) as any;
};
