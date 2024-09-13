import { type Location, Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Get the start point of a location. */
export const getStartPoint = (editor: TEditor, at: Location) =>
  Editor.start(editor as any, at);
