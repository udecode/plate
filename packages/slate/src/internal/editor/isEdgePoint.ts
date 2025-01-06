import { type Location, type Point, isEdge } from 'slate';

import type { Editor } from '../../interfaces/editor/editor';

export const isEdgePoint = (editor: Editor, point: Point, at: Location) =>
  isEdge(editor as any, point, at);
