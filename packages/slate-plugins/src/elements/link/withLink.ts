import get from 'lodash/get';
import { Editor, Range } from 'slate';
import { ReactEditor } from 'slate-react';
import {
  getRangeBefore,
  RangeBeforeOptions,
} from '../../common/queries/getRangeBefore';
import { getRangeFromBlockStart } from '../../common/queries/getRangeFromBlockStart';
import { getText } from '../../common/queries/getText';
import { isCollapsed } from '../../common/queries/isCollapsed';
import { someNode } from '../../common/queries/someNode';
import { unwrapNodes } from '../../common/transforms/unwrapNodes';
import { isUrl as isUrlProtocol, setDefaults } from '../../common/utils';
import { withRemoveEmptyNodes } from '../../normalizers/withRemoveEmptyNodes';
import { DEFAULTS_LINK } from './defaults';
import { upsertLinkAtSelection, wrapLink } from './transforms';
import { LinkOptions, WithLinkOptions } from './types';

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

  unwrapNodes(editor, { at, match: { type: link.type } });

  const newSelection = editor.selection as Range;

  wrapLink(editor, url, {
    link,
    at: {
      ...at,
      focus: newSelection.focus,
    },
  });
};

const upsertLinkIfValid = (
  editor: ReactEditor,
  { link, isUrl }: { link: any; isUrl: any }
) => {
  const rangeFromBlockStart = getRangeFromBlockStart(editor);
  const textFromBlockStart = getText(editor, rangeFromBlockStart);

  if (rangeFromBlockStart && isUrl(textFromBlockStart)) {
    upsertLink(editor, textFromBlockStart, {
      at: rangeFromBlockStart,
      link,
    });
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
export const withLink = (options?: WithLinkOptions) => <T extends ReactEditor>(
  editor: T
) => {
  const { link, isUrl } = setDefaults(options, {
    ...DEFAULTS_LINK,
    isUrl: isUrlProtocol,
  });

  const { insertData, insertText } = editor;

  const DEFAULT_RANGE_BEFORE_OPTIONS: RangeBeforeOptions = {
    matchString: ' ',
    skipInvalid: true,
    afterMatch: true,
    multiPaths: true,
  };

  const rangeOptions: RangeBeforeOptions = {
    ...DEFAULT_RANGE_BEFORE_OPTIONS,
    ...get(options, 'rangeBeforeOptions', {}),
  };

  editor.insertText = (text) => {
    if (text === ' ' && isCollapsed(editor.selection)) {
      const selection = editor.selection as Range;

      if (upsertLinkIfValid(editor, { link, isUrl })) {
        return insertText(text);
      }

      const beforeWordRange = getRangeBefore(editor, selection, rangeOptions);

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

    if (text) {
      if (someNode(editor, { match: { type: link.type } })) {
        return insertText(text);
      }

      if (isUrl(text)) {
        return upsertLinkAtSelection(editor, text, {
          link,
        });
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

  editor = withRemoveEmptyNodes({ type: link.type })(editor);

  return editor;
};
