import { Editor, EditorPreviousOptions } from 'slate';
import { Modify } from '../../types/misc/types';
import { ENode, TNode, TNodeMatch } from '../node/TNode';
import { TNodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

export type GetPreviousNodeOptions<V extends Value = Value> = Modify<
  NonNullable<EditorPreviousOptions<TNode>>,
  {
    match?: TNodeMatch<ENode<V>>;
  }
>;

/**
 * Get the matching node in the branch of the document before a location.
 */
export const getPreviousNode = <N extends ENode<V>, V extends Value = Value>(
  editor: TEditor<V>,
  options?: GetPreviousNodeOptions<V>
): TNodeEntry<N> | undefined =>
  Editor.previous(editor as any, options as any) as any;
