import type { TEditor } from '../interfaces';

/** Remove selection marks. */
export const removeSelectionMark = (editor: TEditor) => {
  const marks = editor.api.marks();

  if (!marks) return;

  // remove all marks
  Object.keys(marks).forEach((key) => {
    editor.tf.removeMark(key);
  });
};
