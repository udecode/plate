import { ReactEditor } from 'slate-react';
import { isUrl } from '../../common/utils';
import { withInline } from '../../element';
import { wrapLink } from './transforms';
import { LINK, WithLinkOptions } from './types';

export const withLink = ({ typeLink = LINK }: WithLinkOptions = {}) => <
  T extends ReactEditor
>(
  editor: T
) => {
  editor = withInline([typeLink])(editor);

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
