import type { Editor } from '../interfaces';

/** Remove selection marks. */
export const removeSelectionMark = (editor: Editor) => {
  const marks = editor.api.marks();

  if (!marks) return;

  // remove all marks
  Object.keys(marks).forEach((key) => {
    editor.tf.removeMark(key);
  });
};
