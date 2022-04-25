import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import {
  NodeOf,
  TNode,
  TNodeEntry,
  TNodeMatch,
} from '../../../types/slate/TNode';

export type GetNextNodeOptions<V extends Value, N extends TNode> = Parameters<
  typeof Editor.next
>[1] & {
  match?: TNodeMatch<N & NodeOf<TEditor<V>>>;
};

/**
 * Get the matching node in the branch of the document after a location.
 */
export const getNextNode = <V extends Value, N extends TNode>(
  editor: TEditor<V>,
  options?: GetNextNodeOptions<V, N>
): TNodeEntry<N & NodeOf<TEditor<V>>> | undefined =>
  Editor.next(editor as any, options) as any;
