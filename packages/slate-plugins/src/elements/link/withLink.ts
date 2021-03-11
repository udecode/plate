import {
  getRangeBefore,
  getRangeFromBlockStart,
  getText,
  isCollapsed,
  isUrl as isUrlProtocol,
  someNode,
  unwrapNodes,
} from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import { withRemoveEmptyNodes } from '../../normalizers/withRemoveEmptyNodes';
import { upsertLinkAtSelection } from './transforms/upsertLinkAtSelection';
import { wrapLink } from './transforms/wrapLink';
import { WithLinkOptions } from './types';

const upsertLink = (
  editor: Editor,
  {
    url,
    at,
  }: {
    url: string;
    at: Range;
  },
  options: SlatePluginsOptions
) => {
  const { a } = options;

  unwrapNodes(editor, { at, match: { type: a.type } });

  const newSelection = editor.selection as Range;

  wrapLink(
    editor,
    {
      at: {
        ...at,
        focus: newSelection.focus,
      },
      url,
    },
    options
  );
};

const upsertLinkIfValid = (
  editor: ReactEditor,
  { isUrl }: { isUrl: any },
  options: SlatePluginsOptions
) => {
  const rangeFromBlockStart = getRangeFromBlockStart(editor);
  const textFromBlockStart = getText(editor, rangeFromBlockStart);

  if (rangeFromBlockStart && isUrl(textFromBlockStart)) {
    upsertLink(
      editor,
      { url: textFromBlockStart, at: rangeFromBlockStart },
      options
    );
    return true;
  }
};

/**
 * Insert space after a url to wrap a link.
 * Lookup from the block start to the cursor to check if there is an url.
 * If not found, lookup before the cursor for a space character to check the url.
 *
 * On insert data:
 * Paste a string inside a link element will edit its children text but not its url.
 *
 */
export const withLink = (
  {
    isUrl = isUrlProtocol,
    rangeBeforeOptions = {
      matchString: ' ',
      skipInvalid: true,
      afterMatch: true,
      multiPaths: true,
    },
  }: WithLinkOptions = {},
  options: SlatePluginsOptions
) => <T extends ReactEditor>(editor: T) => {
  const { a } = options;

  const { insertData, insertText } = editor;

  editor.insertText = (text) => {
    if (text === ' ' && isCollapsed(editor.selection)) {
      const selection = editor.selection as Range;

      if (upsertLinkIfValid(editor, { isUrl }, options)) {
        return insertText(text);
      }

      const beforeWordRange = getRangeBefore(
        editor,
        selection,
        rangeBeforeOptions
      );

      if (beforeWordRange) {
        const beforeWordText = getText(editor, beforeWordRange);

        if (isUrl(beforeWordText)) {
          upsertLink(
            editor,
            { url: beforeWordText, at: beforeWordRange },
            options
          );
        }
      }
    }

    insertText(text);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text) {
      if (someNode(editor, { match: { type: a.type } })) {
        return insertText(text);
      }

      if (isUrl(text)) {
        return upsertLinkAtSelection(editor, { url: text }, { a });
      }
    }

    insertData(data);
  };

  // editor.insertBreak = () => {
  //   if (upsertLinkIfValid(editor, { link, isUrl })) {
  //     console.info('fix cursor');
  //   }
  //
  //   insertBreak();
  // };

  editor = withRemoveEmptyNodes({ type: a.type })(editor);

  return editor;
};
