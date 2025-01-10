import type { Editor } from '../../interfaces/editor/editor-type';

export const hasMark = (editor: Editor, key: string) => {
  return !!editor.api.mark(key);
};
