import { type Location, Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Get the start and end points of a location. */
export const getEdgePoints = (editor: TEditor, at: Location) =>
  Editor.edges(editor as any, at);
