import { Editor } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { EElementEntry } from '../types/TNodeEntry';

export type GetVoidNodeOptions = Parameters<typeof Editor.void>[1];

/**
 * Match a void node in the current branch of the editor.
 */
export const getVoidNode = <V extends Value>(
  editor: TEditor<V>,
  options?: GetVoidNodeOptions
): EElementEntry<V> | undefined => Editor.void(editor as any, options) as any;
