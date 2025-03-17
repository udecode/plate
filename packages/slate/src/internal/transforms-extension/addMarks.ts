import castArray from 'lodash/castArray.js';

import type { AddMarksOptions, Editor, EditorMarks } from '../../interfaces';

export const addMarks = (
  editor: Editor,
  marks: EditorMarks,
  { remove }: AddMarksOptions = {}
) => {
  if (!editor.selection) return;

  editor.tf.withoutNormalizing(() => {
    editor.tf.removeMarks([
      ...castArray<string>(remove),
      ...Object.keys(marks),
    ]);

    Object.entries(marks).forEach(([key, value]) => {
      editor.tf.addMark(key, value);
    });
  });
};
