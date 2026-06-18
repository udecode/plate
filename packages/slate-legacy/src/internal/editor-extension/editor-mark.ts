import type { Editor } from '../../interfaces/index';

export const mark = (editor: Editor, key: string) => {
  const marks = editor.api.marks();

  return (marks as any)?.[key] as unknown;
};
