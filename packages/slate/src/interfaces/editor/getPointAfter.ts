import { Editor, type EditorAfterOptions, type Location } from 'slate';

import type { TEditor, Value } from './TEditor';

/** Get the point after a location. */
export const getPointAfter = <V extends Value>(
  editor: TEditor<V>,
  at: Location,
  options?: EditorAfterOptions
) => Editor.after(editor as any, at, options);
