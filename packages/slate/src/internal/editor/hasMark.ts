import type { TEditor } from '../../interfaces/editor/TEditor';

export const hasMark = (editor: TEditor, key: string) => {
  return !!editor.api.mark(key);
};
