import {
  getEditorString,
  getPluginType,
  getRangeBefore,
  getRangeFromBlockStart,
  isCollapsed,
  mockPlugin,
  moveSelection,
  PlateEditor,
  someNode,
  unwrapNodes,
  Value,
  WithPlatePlugin,
} from '@udecode/plate-core';
import { withRemoveEmptyNodes } from '@udecode/plate-normalizers';
import { Range } from 'slate';
import { upsertLinkAtSelection } from './transforms/upsertLinkAtSelection';
import { wrapLink } from './transforms/wrapLink';
import { ELEMENT_LINK } from './createLinkPlugin';
import { LinkPlugin } from './types';

const upsertLink = <V extends Value>(
  editor: PlateEditor<V>,
  {
    url,
    at,
  }: {
    url: string;
    at: Range;
  }
) => {
  unwrapNodes(editor, {
    at,
    match: { type: getPluginType(editor, ELEMENT_LINK) },
  });

  const newSelection = editor.selection as Range;

  wrapLink(editor, {
    at: {
      ...at,
      focus: newSelection.focus,
    },
    url,
  });
};

const upsertLinkIfValid = <V extends Value>(
  editor: PlateEditor<V>,
  { isUrl }: { isUrl: any }
) => {
  const rangeFromBlockStart = getRangeFromBlockStart(editor);
  const textFromBlockStart = getEditorString(editor, rangeFromBlockStart);

  if (rangeFromBlockStart && isUrl(textFromBlockStart)) {
    upsertLink(editor, { url: textFromBlockStart, at: rangeFromBlockStart });
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
export const withLink = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
>(
  editor: E,
  {
    type,
    options: { isUrl, rangeBeforeOptions },
  }: WithPlatePlugin<LinkPlugin, V, E>
) => {
  const { insertData, insertText } = editor;

  editor.insertText = (text) => {
    if (text === ' ' && isCollapsed(editor.selection)) {
      const selection = editor.selection as Range;

      if (upsertLinkIfValid(editor, { isUrl })) {
        moveSelection(editor, { unit: 'offset' });
        return insertText(text);
      }

      const beforeWordRange = getRangeBefore(
        editor,
        selection,
        rangeBeforeOptions
      );

      if (beforeWordRange) {
        const beforeWordText = getEditorString(editor, beforeWordRange);

        if (isUrl!(beforeWordText)) {
          upsertLink(editor, { url: beforeWordText, at: beforeWordRange });
          moveSelection(editor, { unit: 'offset' });
        }
      }
    }

    insertText(text);
  };

  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text) {
      if (isUrl!(text)) {
        return upsertLinkAtSelection(editor, { url: text });
      }

      if (someNode(editor, { match: { type } })) {
        return insertText(text);
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

  editor = withRemoveEmptyNodes<V, E>(
    editor,
    mockPlugin<{}, V, E>({
      options: { types: type },
    })
  );

  return editor;
};
