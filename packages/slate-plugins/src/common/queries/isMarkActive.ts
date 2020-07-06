import { Editor } from 'slate';

export const isMarkActive = (editor: Editor, type: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[type] === true : false;
};
