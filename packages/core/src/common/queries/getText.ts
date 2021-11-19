import { Editor, Location } from 'slate';
import { TEditor } from '../../types/slate/TEditor';

/**
 * See {@link Editor.string}.
 * If `at` is not defined, return an empty string.
 */
export const getText = (editor: TEditor, at?: Location | null) =>
  (at && Editor.string(editor, at)) ?? '';
