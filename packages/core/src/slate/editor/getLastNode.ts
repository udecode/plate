import { Editor, Location } from 'slate';
import { ENodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

/**
 * Get the last node at a location.
 */
export const getLastNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): ENodeEntry<V> => Editor.last(editor as any, at) as any;
