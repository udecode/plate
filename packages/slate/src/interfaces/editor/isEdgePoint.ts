import { type Location, type Point, Editor } from 'slate';

import type { TEditor } from './TEditor';

/** Check if a point is an edge of a location. */
export const isEdgePoint = (editor: TEditor, point: Point, at: Location) =>
  Editor.isEdge(editor as any, point, at);
