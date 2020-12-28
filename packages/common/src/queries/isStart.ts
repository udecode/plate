import { Editor, Location, Point } from 'slate';

/**
 * {@link Editor.isStart}. If point is null, return false.
 */
export const isStart = (
  editor: Editor,
  point: Point | null | undefined,
  at: Location
): boolean => !!point && Editor.isStart(editor, point, at);
