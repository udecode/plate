import { TEditor } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Editor } from 'slate';
import { isMarkActive } from '../queries/isMarkActive';
import { removeMark } from './removeMark';

/**
 * Add/remove marks in the selection.
 * @param editor
 * @param key mark to toggle
 * @param clear marks to clear when adding mark
 */
export const toggleMark = (
  editor: TEditor,
  key: string,
  clear: string | string[] = []
) => {
  if (!editor.selection) return;

  Editor.withoutNormalizing(editor, () => {
    const isActive = isMarkActive(editor, key);

    if (isActive) {
      removeMark(editor, { key });
      return;
    }

    const clears: string[] = castArray(clear);
    removeMark(editor, { key: clears });

    editor.addMark(key, true);
  });
};
