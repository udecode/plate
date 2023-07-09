import { TEditor, Value, getMarks, removeEditorMark } from '@udecode/slate';

/**
 * Remove selection marks.
 */
export const removeSelectionMark = <V extends Value = Value>(
  editor: TEditor<V>
) => {
  const marks = getMarks(editor);
  if (!marks) return;

  // remove all marks
  Object.keys(marks).forEach((key) => {
    removeEditorMark(editor, key);
  });
};
