import { Editor, Location, Point } from 'slate';
import { TEditor } from '../../types/slate/TEditor';

/**
 * {@link Editor.isEnd}. If point is null, return false.
 */
export const isEnd = (
  editor: TEditor,
  point: Point | null | undefined,
  at: Location
): boolean => !!point && Editor.isEnd(editor, point, at);
