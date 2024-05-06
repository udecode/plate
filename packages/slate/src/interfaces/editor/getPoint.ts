import { Editor, type EditorPointOptions, type Location } from 'slate';

import type { TEditor, Value } from './TEditor';

/** Get the start or end point of a location. */
export const getPoint = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorPointOptions
) => Editor.point(editor as any, at, options);
