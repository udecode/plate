import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import {
  NodeOf,
  TNode,
  TNodeEntry,
  TNodeMatch,
} from '../../../types/slate/TNode';

export type GetPreviousNodeOptions<
  V extends Value,
  N extends TNode
> = Parameters<typeof Editor.previous>[1] & {
  match?: TNodeMatch<N & NodeOf<TEditor<V>>>;
};

/**
 * Get the matching node in the branch of the document before a location.
 */
export const getPreviousNode = <V extends Value, N extends TNode>(
  editor: TEditor<V>,
  options?: GetPreviousNodeOptions<V, N>
): TNodeEntry<N & NodeOf<TEditor<V>>> | undefined =>
  Editor.previous(editor as any, options) as any;
