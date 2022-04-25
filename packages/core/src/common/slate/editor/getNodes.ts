import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import {
  NodeOf,
  TNode,
  TNodeEntry,
  TNodeMatch,
} from '../../../types/slate/TNode';
import { getQueryOptions } from '../../queries/match';
import { unhangRange, UnhangRangeOptions } from './unhangRange';

export type GetNodesOptions<V extends Value, N extends TNode> = Parameters<
  typeof Editor.nodes
>[1] & {
  match?: TNodeMatch<N & NodeOf<TEditor<V>>>;
};

/**
 * Iterate through all of the nodes in the Editor.
 */
export const getNodes = <V extends Value, N extends TNode>(
  editor: TEditor<V>,
  options?: GetNodesOptions<V, N> & UnhangRangeOptions
): Generator<TNodeEntry<N & NodeOf<TEditor<V>>>, void, undefined> => {
  unhangRange(editor, options?.at, options);

  return Editor.nodes(editor as any, getQueryOptions(editor, options)) as any;
};
