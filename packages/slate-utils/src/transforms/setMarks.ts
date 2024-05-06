import {
  type EMarks,
  type TEditor,
  type Value,
  withoutNormalizing,
} from '@udecode/slate';
import castArray from 'lodash/castArray.js';

import { removeMark } from './removeMark';

/** Set marks to selected text. */
export const setMarks = <V extends Value>(
  editor: TEditor<V>,
  marks: EMarks<V>,
  clear: string | string[] = []
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
