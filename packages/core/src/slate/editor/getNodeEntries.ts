import { Editor } from 'slate';
import { ENodeMatchOptions, getQueryOptions } from '../../common/queries/match';
import { Modify } from '../../common/types/utility/types';
import { ENode } from '../node/TNode';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';
import { unhangRange, UnhangRangeOptions } from './unhangRange';

export type GetNodeEntriesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Editor.nodes>[1]>,
  ENodeMatchOptions<V>
>;

/**
 * Iterate through all of the nodes in the Editor.
 */
export const getNodeEntries = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: GetNodeEntriesOptions<V> & UnhangRangeOptions
): Generator<TNodeEntry<N>, void, undefined> => {
  unhangRange(editor, options?.at, options);

  return Editor.nodes(editor as any, getQueryOptions(editor, options)) as any;
};
