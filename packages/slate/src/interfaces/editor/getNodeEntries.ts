import { Modify } from '@udecode/utils';
import { Editor, EditorNodesOptions } from 'slate';
import { ENodeMatchOptions, getQueryOptions } from '../../utils/match';
import { ENode, TNode } from '../node/TNode';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';
import { unhangRange, UnhangRangeOptions } from './unhangRange';

export type GetNodeEntriesOptions<V extends Value = Value> = Modify<
  NonNullable<EditorNodesOptions<TNode>>,
  ENodeMatchOptions<V>
> &
  UnhangRangeOptions;

/**
 * Iterate through all of the nodes in the Editor.
 */
export const getNodeEntries = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: GetNodeEntriesOptions<V>
): Generator<TNodeEntry<N>, void, undefined> => {
  unhangRange(editor, options?.at, options);

  return Editor.nodes(editor as any, getQueryOptions(editor, options)) as any;
};
