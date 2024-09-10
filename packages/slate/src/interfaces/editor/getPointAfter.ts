import { Editor, type EditorAfterOptions, type Location } from 'slate';

import type { TEditor } from './TEditor';

/** Get the point after a location. */
export const getPointAfter = (
  editor: TEditor,
  at: Location,
  options?: EditorAfterOptions
) => Editor.after(editor as any, at, options);
