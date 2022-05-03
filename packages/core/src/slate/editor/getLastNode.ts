import { Editor, Location } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { ENodeEntry } from '../types/TNodeEntry';

/**
 * Get the last node at a location.
 */
export const getLastNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): ENodeEntry<V> => Editor.last(editor as any, at) as any;
