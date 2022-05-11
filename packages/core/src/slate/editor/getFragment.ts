import { Editor, Location } from 'slate';
import { EDescendant } from '../node/TDescendant';
import { TEditor, Value } from './TEditor';

/**
 * Get the fragment at a location.
 */
export const getFragment = <V extends Value>(
  editor: TEditor<V>,
  at: Location
): EDescendant<V>[] => Editor.fragment(editor as any, at) as any;
