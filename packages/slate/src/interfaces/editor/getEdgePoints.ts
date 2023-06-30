import { Editor, Location } from 'slate';

import { TEditor, Value } from './TEditor';

/**
 * Get the start and end points of a location.
 */
export const getEdgePoints = <V extends Value>(
  editor: TEditor<V>,
  at: Location
) => Editor.edges(editor as any, at);
