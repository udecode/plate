import { getMarks } from '../slate/editor/getMarks';
import { TEditor, Value } from '../slate/editor/TEditor';
import { EMarks } from '../slate/text/TText';

/**
 * Get selected mark by type.
 */
export const getMark = <V extends Value, K extends keyof EMarks<V>>(
  editor: TEditor<V>,
  type: K
) => {
  if (!editor) return;

  const marks = getMarks(editor);

  return marks?.[type] as K | undefined;
};
