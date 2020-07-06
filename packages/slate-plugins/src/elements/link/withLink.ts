import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { getRangeBefore } from '../../common/queries/getRangeBefore';
import { getRangeFromBlockStart } from '../../common/queries/getRangeFromBlockStart';
import { getText } from '../../common/queries/getText';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { isNodeTypeIn } from '../../common/queries/isNodeTypeIn';
import { unwrapNodesByType } from '../../common/transforms/unwrapNodesByType';
import { isUrl as isUrlProtocol } from '../../common/utils';
import { upsertLinkAtSelection, wrapLink } from './transforms';
import { LINK } from './types';

const upsertLink = (
  editor: Editor,
  url: string,
  {
    at,
    typeLink,
  }: {
    at: Range;
    typeLink: string;
  }
) => {
  unwrapNodesByType(editor, typeLink, { at });

  const newSelection = editor.selection as Range;

  wrapLink(editor, url, {
    typeLink,
    at: {
      ...at,
      focus: newSelection.focus,
    },
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
    if (text === ' ' && isCollapsed(editor.selection)) {
      const selection = editor.selection as Range;

      const rangeFromBlockStart = getRangeFromBlockStart(editor);
      const textFromBlockStart = getText(editor, rangeFromBlockStart);

      if (rangeFromBlockStart && isUrl(textFromBlockStart)) {
        upsertLink(editor, textFromBlockStart, {
          at: rangeFromBlockStart,
          typeLink,
        });
        return insertText(text);
      }

      const beforeWordRange = getRangeBefore(editor, selection, {
        matchString: ' ',
        skipInvalid: true,
        afterMatch: true,
        multiPaths: true,
      });

      if (beforeWordRange) {
        const beforeWordText = getText(editor, beforeWordRange);

        if (isUrl(beforeWordText)) {
          upsertLink(editor, beforeWordText, {
            at: beforeWordRange,
            typeLink,
          });
        }
      }
    }

    insertText(text);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text) && !isNodeTypeIn(editor, typeLink)) {
      upsertLinkAtSelection(editor, text, {
        typeLink,
      });
    } else {
      insertData(data);
    }
  };

  return editor;
};
