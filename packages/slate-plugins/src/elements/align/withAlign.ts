import { ReactEditor } from 'slate-react';
import { wrapAlign } from './transforms';

export const withAlign = () => <T extends ReactEditor>(editor: T) => {
  const { insertData, insertText } = editor;

  editor.insertText = (text) => {
    if (text) {
      wrapAlign(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');
    if (text) {
      wrapAlign(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
