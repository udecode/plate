import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { getRangeBefore } from '../../common/queries/getRangeBefore';
import { getText } from '../../common/queries/getText';
import { getTextFromBlockStartToAnchor } from '../../common/queries/getTextFromBlockStartToAnchor';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { unwrapNodesByType } from '../../common/transforms/unwrapNodesByType';
import { isUrl as isUrlProtocol } from '../../common/utils';
import { wrapLink } from './transforms';
import { LINK } from './types';

/**
 * Unwrap link at a location (default: selection).
 * Then, the focus of the location is set to selection focus.
 * Then, wrap the link at the location.
 */
export const wrapLinkToSelection = (
  editor: Editor,
  url: string,
  {
    typeLink = LINK,
    at,
  }: {
    typeLink?: string;
    at?: Range;
  }
) => {
  if (!isCollapsed(editor.selection)) return;

  unwrapNodesByType(editor, typeLink, { at });
  if (at) {
    at.focus = (editor.selection as Range).focus;
  }
  wrapLink(editor, url, {
    typeLink,
    at,
  });
};

/**
 * Insert space after a url to wrap a link.
 * Lookup from the block start to the cursor to check if there is an url.
 * If not found, lookup before the cursor for a space character to check the url.
 */
export const withLink = ({ typeLink = LINK, isUrl = isUrlProtocol } = {}) => <
  T extends ReactEditor
>(
  editor: T
) => {
  const { insertData, insertText } = editor;

  editor.insertText = (text) => {
    if (text === ' ' && editor.selection && isCollapsed(editor.selection)) {
      const blockStartToAnchor = getTextFromBlockStartToAnchor(editor);

      if (blockStartToAnchor.range && isUrl(blockStartToAnchor.text)) {
        wrapLinkToSelection(editor, blockStartToAnchor.text, {
          typeLink,
          at: blockStartToAnchor.range,
        });
        return insertText(text);
      }

      const beforeWordRange = getRangeBefore(editor, editor.selection, {
        matchString: ' ',
        skipInvalid: true,
        afterMatch: true,
        multiPaths: true,
      });

      if (beforeWordRange) {
        const beforeWordText = getText(editor, beforeWordRange);

        if (isUrl(beforeWordText)) {
          wrapLinkToSelection(editor, beforeWordText, {
            typeLink,
            at: beforeWordRange,
          });
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
