import { type Location, type Point, Editor } from 'slate';

import type { TEditor } from './TEditor';

export const isEdgePoint = (editor: TEditor, point: Point, at: Location) =>
  Editor.isEdge(editor as any, point, at);
