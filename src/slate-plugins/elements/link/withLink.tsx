import isUrl from 'is-url';
import { Editor } from 'slate';
import { ElementType } from 'slate-plugins/common/constants/formats';
import { wrapLink } from './transforms';

export const withLink = (editor: Editor) => {
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
