import { Editor, type EditorBeforeOptions, type Location } from 'slate';

import type { TEditor } from './TEditor';

/** Get the point before a location. */
export const getPointBefore = (
  editor: TEditor,
  at: Location,
  options?: EditorBeforeOptions
) => Editor.before(editor as any, at, options);
