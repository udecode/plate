import castArray from 'lodash/castArray.js';

import type { Editor, ToggleMarkOptions } from '../../interfaces';

/** Add or remove mark in the selection. */
export const toggleMark = (
  editor: Editor,
  key: string,
  { remove }: ToggleMarkOptions = {}
) => {
  if (!editor.selection) return;

  editor.tf.withoutNormalizing(() => {
    if (editor.api.hasMark(key)) {
      editor.removeMark(key);

      return;
    }

    editor.tf.removeMarks([...castArray<string>(remove), key]);

    editor.addMark(key, true);
  });
};
