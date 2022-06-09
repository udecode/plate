import { Editor, Location } from 'slate';
import { TEditor, Value } from './TEditor';

/**
 * Get the start point of a location.
 */
export const getStartPoint = <V extends Value>(
  editor: TEditor<V>,
  at: Location
) => Editor.start(editor as any, at);
