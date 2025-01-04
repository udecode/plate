import type { TEditor } from '../../interfaces/index';

export const getMark = (editor: TEditor, key: string) => {
  const marks = editor.api.marks();

  return (marks as any)?.[key] as unknown;
};
