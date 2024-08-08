import { Editor, type Location } from 'slate';

import type { TEditor } from './TEditor';

/** Get a range of a location. */
export const getRange = (editor: TEditor, at: Location, to?: Location) =>
  Editor.range(editor as any, at, to);
