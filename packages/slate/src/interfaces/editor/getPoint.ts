import { Editor, EditorPointOptions, Location } from 'slate';

import { TEditor, Value } from './TEditor';

/**
 * Get the start or end point of a location.
 */
export const getPoint = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorPointOptions
) => Editor.point(editor as any, at, options);
