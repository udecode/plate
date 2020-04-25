import { Editor } from 'slate';

export const clearMark = (editor: Editor, format: string) => {
  Editor.removeMark(editor, format);
};
