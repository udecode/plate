import { TEditor } from '@udecode/slate-plugins-core';
import castArray from 'lodash/castArray';
import { isMarkActive } from '../queries/isMarkActive';
import { removeMark } from './removeMark';

/**
 * Set marks to selected text.
 */
export const setMarks = (
  editor: TEditor,
  marks: Record<string, any>,
  clear: string | string[] = []
) => {
  if (!editor.selection) return;

  const clears: string[] = castArray(clear);
  clears.forEach((item) => {
    removeMark(editor, { key: item });
  });

  Object.keys(marks).forEach((key) => {
    const markIsActive = isMarkActive(editor, key);

    if (markIsActive) {
      removeMark(editor, { key });
    }

    editor.addMark(key, marks[key]);
  });
};
