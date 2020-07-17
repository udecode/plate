import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { getRangeBefore } from '../../common/queries/getRangeBefore';
import { getRangeFromBlockStart } from '../../common/queries/getRangeFromBlockStart';
import { getText } from '../../common/queries/getText';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { isNodeTypeIn } from '../../common/queries/isNodeTypeIn';
import { unwrapNodesByType } from '../../common/transforms/unwrapNodesByType';
import { isUrl as isUrlProtocol, setDefaults } from '../../common/utils';
import { DEFAULTS_LINK } from './defaults';
import { upsertLinkAtSelection, wrapLink } from './transforms';
import { LinkOptions } from './types';

const upsertLink = (
  editor: Editor,
  url: string,
  {
    at,
    ...options
  }: {
    at: Range;
  } & LinkOptions
) => {
  const { link } = setDefaults(options, DEFAULTS_LINK);

  unwrapNodesByType(editor, link.type, { at });

  const newSelection = editor.selection as Range;

  wrapLink(editor, url, {
    link,
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
export const withLink = (options?: LinkOptions & { isUrl?: Function }) => <
  T extends ReactEditor
>(
  editor: T
) => {
  const { link, isUrl } = setDefaults(options, {
    ...DEFAULTS_LINK,
    isUrl: isUrlProtocol,
  });

  const { insertData, insertText } = editor;

  editor.insertText = (text) => {
    if (text === ' ' && isCollapsed(editor.selection)) {
      const selection = editor.selection as Range;

      const rangeFromBlockStart = getRangeFromBlockStart(editor);
      const textFromBlockStart = getText(editor, rangeFromBlockStart);

      if (rangeFromBlockStart && isUrl(textFromBlockStart)) {
        upsertLink(editor, textFromBlockStart, {
          at: rangeFromBlockStart,
          link,
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
            link,
          });
        }
      }
    }

    insertText(text);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text) && !isNodeTypeIn(editor, link.type)) {
      upsertLinkAtSelection(editor, text, {
        link,
      });
    } else {
      insertData(data);
    }
  };

  return editor;
};
