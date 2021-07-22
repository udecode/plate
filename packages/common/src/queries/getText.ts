import { TEditor } from '@udecode/plate-core';
import { Editor, Location } from 'slate';

/**
 * See {@link Editor.string}.
 * If `at` is not defined, return an empty string.
 */
export const getText = (editor: TEditor, at?: Location | null) =>
  (at && Editor.string(editor, at)) ?? '';
