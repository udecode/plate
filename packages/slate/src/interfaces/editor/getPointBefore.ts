import { Editor, EditorBeforeOptions, Location } from 'slate';

import { TEditor, Value } from './TEditor';

/**
 * Get the point before a location.
 */
export const getPointBefore = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorBeforeOptions
) => Editor.before(editor as any, at, options);
