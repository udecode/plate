import { Editor, type Location, type Point } from 'slate';

import type { TEditor } from './TEditor';

/**
 * Check if a point is the end point of a location. If point is null, return
 * false.
 */
export const isEndPoint = (
  editor: TEditor,
  point: Point | null | undefined,
  at: Location
) => !!point && Editor.isEnd(editor as any, point, at);
