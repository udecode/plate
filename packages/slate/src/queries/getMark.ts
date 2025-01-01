import type { TEditor } from '../interfaces';

/** Get selection mark value by key. */
export const getMark = (editor: TEditor, key: string) => {
  if (!editor) return;

  const marks = editor.api.marks();

  return (marks as any)?.[key] as unknown;
};
