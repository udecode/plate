import { ReactEditor } from 'slate-react';
import { isUrl } from '../../common/utils';
import { wrapLink } from './transforms';

export const withLink = () => <T extends ReactEditor>(editor: T) => {
  const { insertData, insertText } = editor;

  editor.insertText = (text) => {
    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
