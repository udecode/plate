import { TEditor } from '@udecode/plate-core';
import castArray from 'lodash/castArray';
import { Editor } from 'slate';
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

  Editor.withoutNormalizing(editor, () => {
    const clears: string[] = castArray(clear);
    removeMark(editor, { key: clears });
    removeMark(editor, { key: Object.keys(marks) });

    Object.keys(marks).forEach((key) => {
      editor.addMark(key, marks[key]);
    });
  });
};
