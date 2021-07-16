import { BaseEditor, Editor } from 'slate';

/**
 * Return the marks in the selection.
 * @param editor
 * @param type
 */
export const getMark = (editor: BaseEditor, type: string): any => {
  if (!editor) {
    return;
  }

  const marks = Editor.marks(editor);
  return marks && marks[type];
};
