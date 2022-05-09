import { Editor } from 'slate';
import { TEditor, Value } from './TEditor';
import { EElement } from '../element/TElement';
import { TNodeEntry } from '../node/TNodeEntry';

export type GetVoidNodeOptions = Parameters<typeof Editor.void>[1];

/**
 * Match a void node in the current branch of the editor.
 */
export const getVoidNode = <N extends EElement<V>, V extends Value>(
  editor: TEditor<V>,
  options?: GetVoidNodeOptions
): TNodeEntry<N> | undefined => Editor.void(editor as any, options) as any;
