import castArray from 'lodash/castArray';
import { Editor } from 'slate';
import { isMarkActive } from '../queries/isMarkActive';

/**
 * Add/remove marks in the selection.
 * @param key mark to toggle
 * @param clear marks to clear when adding mark
 */
export const toggleMark = (
  editor: Editor,
  key: string,
  clear: string | string[] = []
) => {
  const isActive = isMarkActive(editor, key);

  if (isActive) {
    editor.removeMark(key);
    return;
  }

  const clears: string[] = castArray(clear);
  clears.forEach((item) => {
    editor.removeMark(item);
  });

  editor.addMark(key, true);
};
