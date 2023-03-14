import { getMarks, TEditor, Value } from '@udecode/slate';

/**
 * Get selection mark value by key.
 */
export const getMark = <V extends Value>(editor: TEditor<V>, key: string) => {
  if (!editor) return;

  const marks = getMarks(editor);

  return marks?.[key] as unknown;
};
