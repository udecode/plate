import { type Location, Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Get the end point of a location. */
export const getEndPoint = (editor: TEditor, at: Location) =>
  Editor.end(editor as any, at);
