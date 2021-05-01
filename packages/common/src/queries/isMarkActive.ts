import { TEditor } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';

export const isMarkActive = (editor: TEditor, type: string) => {
  const marks = Editor.marks(editor);
  return marks ? marks[type] === true : false;
};
