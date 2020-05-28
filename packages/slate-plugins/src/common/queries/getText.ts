import { Editor, Location } from 'slate';

/**
 * See {@link Editor.string}.
 * If `at` is not defined, return an empty string.
 */
export const getText = (editor: Editor, at?: Location | null) =>
  (at && Editor.string(editor, at)) ?? '';
