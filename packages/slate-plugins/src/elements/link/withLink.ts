import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { getPointBefore } from '../../common/queries/getPointBefore';
import { getText } from '../../common/queries/getText';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { isUrl } from '../../common/utils';
import { wrapLink } from './transforms';

/**
 * Insert space after a url to wrap a link. There should be a space before the url.
 * TODO: it's not working when the url is at the start of the block.
 */
export const withLink = () => <T extends ReactEditor>(editor: T) => {
  const { insertData, insertText } = editor;

  editor.insertText = (text) => {
    if (text === ' ' && editor.selection && isCollapsed(editor.selection)) {
      const beforeWordStart = getPointBefore(editor, editor.selection, {
        matchString: ' ',
      });

      if (beforeWordStart) {
        const beforeWordRange = {
          anchor: beforeWordStart,
          focus: editor.selection.focus,
        };
        const beforeWordText = getText(editor, beforeWordRange);

        if (isUrl(beforeWordText)) {
          Transforms.select(editor, beforeWordRange);
          // editor.
          wrapLink(editor, beforeWordText);
        }
      }
    }

    insertText(text);
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
