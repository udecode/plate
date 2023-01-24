import { getMarks, TEditor, Value } from '../slate/index';
import { removeMark } from './removeMark';

/**
 * Remove selection marks.
 */
export const removeSelectionMark = <V extends Value = Value>(
  editor: TEditor<V>
) => {
  const marks = getMarks(editor);
  if (!marks) return;

  // remove all marks
  removeMark(editor, {
    key: Object.keys(marks),
  });
};
