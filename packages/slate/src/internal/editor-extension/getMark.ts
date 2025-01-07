import type { Editor } from '../../interfaces/index';

export const getMark = (editor: Editor, key: string) => {
  const marks = editor.api.marks();

  return (marks as any)?.[key] as unknown;
};
