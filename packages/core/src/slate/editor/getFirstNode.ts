import { Editor, Location } from 'slate';
import { TEditor, Value } from '../types/TEditor';
import { ENodeEntry } from '../types/TNodeEntry';

/**
 * Get the first node at a location.
 */
export const getFirstNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): ENodeEntry<V> => Editor.first(editor as any, at) as any;
