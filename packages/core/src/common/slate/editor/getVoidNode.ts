import { Editor } from 'slate';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { ElementOf } from '../../../types/slate/TElement';
import { TNodeEntry } from '../../../types/slate/TNode';

export type GetVoidNodeOptions = Parameters<typeof Editor.void>[1];

/**
 * Match a void node in the current branch of the editor.
 */
export const getVoidNode = <V extends Value>(
  editor: TEditor<V>,
  options?: GetVoidNodeOptions
): TNodeEntry<ElementOf<TEditor<V>>> | undefined =>
  Editor.void(editor as any, options) as any;
