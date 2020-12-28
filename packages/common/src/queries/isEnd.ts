import { Editor, Location, Point } from 'slate';

/**
 * {@link Editor.isEnd}. If point is null, return false.
 */
export const isEnd = (
  editor: Editor,
  point: Point | null | undefined,
  at: Location
): boolean => !!point && Editor.isEnd(editor, point, at);
