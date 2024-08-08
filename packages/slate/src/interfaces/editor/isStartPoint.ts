import { Editor, type Location, type Point } from 'slate';

import type { TEditor } from './TEditor';

/**
 * Check if a point is the start point of a location. If point is null, return
 * false.
 */
export const isStartPoint = (
  editor: TEditor,
  point: Point | null | undefined,
  at: Location
) => !!point && Editor.isStart(editor as any, point, at);
