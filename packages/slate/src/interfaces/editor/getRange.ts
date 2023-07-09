import { Editor, Location } from 'slate';

import { TEditor, Value } from './TEditor';

/**
 * Get a range of a location.
 */
export const getRange = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  to?: Location
) => Editor.range(editor as any, at, to);
