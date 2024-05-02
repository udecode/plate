import { Editor, type Location, type Point } from 'slate';

import type { TEditor, Value } from './TEditor';

/** Check if a point is an edge of a location. */
export const isEdgePoint = <V extends Value>(
  editor: TEditor<V>,
  point: Point,
  at: Location
) => Editor.isEdge(editor as any, point, at);
