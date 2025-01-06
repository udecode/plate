import castArray from 'lodash/castArray.js';

import type { Editor, MarksOf } from '../interfaces';

import { removeMark } from './removeMark';

/** Set marks to selected text. */
export const setMarks = <E extends Editor>(
  editor: E,
  marks: MarksOf<E>,
  clear: string[] | string = []
) => {
  if (!editor.selection) return;

  editor.tf.withoutNormalizing(() => {
    const clears = castArray<string>(clear);
    removeMark(editor, { key: clears });
    removeMark(editor, { key: Object.keys(marks) });

    Object.keys(marks).forEach((key) => {
      editor.addMark(key, (marks as any)[key]);
    });
  });
};
