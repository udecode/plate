import { Editor, Location } from 'slate';

import { ENodeEntry } from '../node/TNodeEntry';
import { TEditor, Value } from './TEditor';

/**
 * Get the first node at a location.
 */
export const getFirstNode = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): ENodeEntry<V> => Editor.first(editor as any, at) as any;
