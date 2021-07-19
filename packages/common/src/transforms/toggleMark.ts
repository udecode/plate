import { TEditor } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { isMarkActive } from '../queries/isMarkActive';
import { removeMark } from './removeMark';

/**
 * Add/remove marks in the selection.
 * @param key mark to toggle
 * @param clear marks to clear when adding mark
 */
export const toggleMark = (
  editor: TEditor,
  key: string,
  clear: string | string[] = []
) => {
  if (!editor.selection) return;

  const isActive = isMarkActive(editor, key);

  if (isActive) {
    removeMark(editor, { key });
    return;
  }

  const clears: string[] = castArray(clear);
  clears.forEach((item) => {
    removeMark(editor, { key: item });
  });

  editor.addMark(key, true);
};
