import { withInline } from 'elements/withInline';
import isUrl from 'is-url';
import { ReactEditor } from 'slate-react';
import { wrapLink } from './transforms';
import { LINK } from './types';

export const withLink = <T extends ReactEditor>(editor: T) => {
  editor = withInline([LINK])(editor);

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
