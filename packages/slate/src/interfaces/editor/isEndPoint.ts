import { Editor, Location, Point } from 'slate';
import { TEditor, Value } from './TEditor';

/**
 * Check if a point is the end point of a location.
 * If point is null, return false.
 */
export const isEndPoint = <V extends Value>(
  editor: TEditor<V>,
  point: Point | null | undefined,
  at: Location
) => !!point && Editor.isEnd(editor as any, point, at);
