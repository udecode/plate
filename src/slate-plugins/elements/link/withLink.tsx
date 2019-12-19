import isUrl from 'is-url';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { ReactEditor } from 'slate-react';
import { wrapLink } from './transforms';

export const withLink = <T extends ReactEditor>(editor: T) => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === ElementType.LINK ? true : isInline(element);
  };

  editor.insertText = text => {
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
