import { type TEditor, getMarks, removeEditorMark } from '@udecode/slate';

/** Remove selection marks. */
export const removeSelectionMark = (editor: TEditor) => {
  const marks = getMarks(editor);

  if (!marks) return;

  // remove all marks
  Object.keys(marks).forEach((key) => {
    removeEditorMark(editor, key);
  });
};
