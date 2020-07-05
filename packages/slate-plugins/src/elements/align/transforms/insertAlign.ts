import { Editor } from 'slate';
import { wrapAlign } from './wrapAlign';

export const insertAlign = (editor: Editor, { typeAlign }: any) => {
  if (editor.selection) {
    wrapAlign(editor, { typeAlign });
  }
};
