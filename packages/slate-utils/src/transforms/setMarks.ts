import { type MarksOf, type TEditor, withoutNormalizing } from '@udecode/slate';
import castArray from 'lodash/castArray.js';

import { removeMark } from './removeMark';

/** Set marks to selected text. */
export const setMarks = <E extends TEditor>(
  editor: E,
  marks: MarksOf<E>,
  clear: string[] | string = []
) => {
  if (!editor.selection) return;

  withoutNormalizing(editor, () => {
    const clears = castArray<string>(clear);
    removeMark(editor, { key: clears });
    removeMark(editor, { key: Object.keys(marks) });

    Object.keys(marks).forEach((key) => {
      editor.addMark(key, (marks as any)[key]);
    });
  });
};
