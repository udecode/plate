import { Editor } from 'slate';
import { Modify } from '../../common/types/utility/types';
import { TEditor, Value } from '../types/TEditor';
import { ENode, TNode, TNodeMatch } from '../types/TNode';
import { TNodeEntry } from '../types/TNodeEntry';

export type GetNextNodeOptions<V extends Value, N extends TNode> = Modify<
  NonNullable<Parameters<typeof Editor.next>[1]>,
  {
    match?: TNodeMatch<ENode<V>>;
  }
>;

/**
 * Get the matching node in the branch of the document after a location.
 */
export const getNextNode = <V extends Value, N extends TNode>(
  editor: TEditor<V>,
  options?: GetNextNodeOptions<V, N>
): TNodeEntry<N & ENode<V>> | undefined =>
  Editor.next(editor as any, options as any) as any;
