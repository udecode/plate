import { Editor, type EditorPathOptions, type Location } from 'slate';

import type { TEditor, Value } from './TEditor';

/** Get the path of a location. */
export const getPath = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorPathOptions
) => Editor.path(editor as any, at, options as any);
