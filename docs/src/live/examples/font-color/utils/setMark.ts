import { removeMark } from '@udecode/slate-plugins';
import { TEditor } from '@udecode/slate-plugins-core';
import castArray from 'lodash/castArray';
import { getMark } from './getMark';

/**
 * Add/remove marks in the selection.
 * @param editor
 * @param mark mark to toggle
 * @param value
 * @param clear marks to clear when adding mark
 */
export const setMark = (
  editor: TEditor,
  mark: string,
  value: any = true,
  clear: string | string[] = []
) => {
  if (!editor?.selection) {
    return;
  }

  const activeMark = getMark(editor, mark);

  if (activeMark) {
    removeMark(editor, { key: mark });
  }

  const clears: string[] = castArray(clear);
  clears.forEach((item) => {
    removeMark(editor, { key: item });
  });

  editor.addMark(mark, value);
};
