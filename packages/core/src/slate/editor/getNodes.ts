import { Editor } from 'slate';
import { getQueryOptions } from '../../common/queries/match';
import { Modify } from '../../common/types/utility/types';
import { TEditor, Value } from '../types/TEditor';
import { ENode, TNode, TNodeMatch } from '../types/TNode';
import { TNodeEntry } from '../types/TNodeEntry';
import { unhangRange, UnhangRangeOptions } from './unhangRange';

export type GetNodesOptions<V extends Value> = Modify<
  NonNullable<Parameters<typeof Editor.nodes>[1]>,
  {
    match?: TNodeMatch<ENode<V>>;
  }
>;

/**
 * Iterate through all of the nodes in the Editor.
 */
export const getNodes = <V extends Value, N extends TNode>(
  editor: TEditor<V>,
  options?: GetNodesOptions<V> & UnhangRangeOptions
): Generator<TNodeEntry<N & ENode<V>>, void, undefined> => {
  unhangRange(editor, options?.at, options);

  return Editor.nodes(editor as any, getQueryOptions(editor, options)) as any;
};
