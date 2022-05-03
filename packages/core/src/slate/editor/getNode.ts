import { Editor, Location } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { ENodeEntry } from '../types/TNodeEntry';

export type GetNodeEntryOptions = Parameters<typeof Editor.node>[2];

/**
 * Get the node at a location.
 */
export const getNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: GetNodeEntryOptions
): ENodeEntry<V> => Editor.node(editor as any, at, options) as any;
