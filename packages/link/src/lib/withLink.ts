import {
  type ExtendEditor,
  collapseSelection,
  getAboveNode,
  getEditorPlugin,
  getEditorString,
  getNextNodeStartPoint,
  getPreviousNodeEndPoint,
  getRangeBefore,
  getRangeFromBlockStart,
  insertNodes,
  isCollapsed,
  isEndPoint,
  isStartPoint,
  select,
  someNode,
  withoutNormalizing,
} from '@udecode/plate-common';
import {
  RemoveEmptyNodesPlugin,
  withRemoveEmptyNodes,
} from '@udecode/plate-normalizers';
import { Path, type Point, type Range } from 'slate';

import type { BaseLinkConfig } from './BaseLinkPlugin';

import { upsertLink } from './transforms/index';

/**
 * Insert space after a url to wrap a link. Lookup from the block start to the
 * cursor to check if there is an url. If not found, lookup before the cursor
 * for a space character to check the url.
 *
 * On insert data: Paste a string inside a link element will edit its children
 * text but not its url.
 */

export const withLink: ExtendEditor<BaseLinkConfig> = ({
  editor,
  getOptions,
  type,
}) => {
  const { apply, insertBreak, insertData, insertText, normalizeNode } = editor;

  const wrapLink = () => {
    const { getUrlHref, isUrl, rangeBeforeOptions } = getOptions();

    withoutNormalizing(editor, () => {
      const selection = editor.selection!;

      // get the range from first space before the cursor
      let beforeWordRange = getRangeBefore(
        editor,
        selection,
        rangeBeforeOptions
      );

      // if no space found before, get the range from block start
      if (!beforeWordRange) {
        beforeWordRange = getRangeFromBlockStart(editor);
      }
      // if no word found before the cursor, exit
      if (!beforeWordRange) return;

      const hasLink = someNode(editor, {
        at: beforeWordRange,
        match: { type },
      });

      // if word before the cursor has a link, exit
      if (hasLink) return;

      let beforeWordText = getEditorString(editor, beforeWordRange);
      beforeWordText = getUrlHref?.(beforeWordText) ?? beforeWordText;

      // if word before is not an url, exit
      if (!isUrl!(beforeWordText)) return;

      // select the word to wrap link
      select(editor, beforeWordRange);

      // wrap link
      upsertLink(editor, {
        url: beforeWordText,
      });

      // collapse selection
      collapseSelection(editor, { edge: 'end' });
    });
  };

  editor.insertBreak = () => {
    if (!isCollapsed(editor.selection)) return insertBreak();

    wrapLink();
    insertBreak();
  };

  editor.insertText = (text) => {
    if (text === ' ' && isCollapsed(editor.selection)) {
      wrapLink();
    }

    insertText(text);
  };

  editor.insertData = (data: DataTransfer) => {
    const { getUrlHref, keepSelectedTextOnPaste } = getOptions();

    const text = data.getData('text/plain');
    const textHref = getUrlHref?.(text);

    if (text) {
      const value = textHref || text;
      const inserted = upsertLink(editor, {
        insertTextInLink: true,
        text: keepSelectedTextOnPaste ? undefined : value,
        url: value,
      });

      if (inserted) return;
    }

    insertData(data);
  };

  // TODO: plugin
  editor.apply = (operation) => {
    if (operation.type === 'set_selection') {
      const range = operation.newProperties as Range | null;

      if (range?.focus && range.anchor && isCollapsed(range)) {
        const entry = getAboveNode(editor, {
          at: range,
          match: { type },
        });

        if (entry) {
          const [, path] = entry;

          let newPoint: Point | undefined;

          if (isStartPoint(editor, range.focus, path)) {
            newPoint = getPreviousNodeEndPoint(editor, path);
          }
          if (isEndPoint(editor, range.focus, path)) {
            newPoint = getNextNodeStartPoint(editor, path);
          }
          if (newPoint) {
            operation.newProperties = {
              anchor: newPoint,
              focus: newPoint,
            };
          }
        }
      }
    }

    apply(operation);
  };

  // TODO: plugin
  editor.normalizeNode = ([node, path]) => {
    if (node.type === type) {
      const range = editor.selection as Range | null;

      if (
        range &&
        isCollapsed(range) &&
        isEndPoint(editor, range.focus, path)
      ) {
        const nextPoint = getNextNodeStartPoint(editor, path);

        // select next text node if any
        if (nextPoint) {
          select(editor, nextPoint);
        } else {
          // insert text node then select
          const nextPath = Path.next(path);
          insertNodes(editor, { text: '' } as any, { at: nextPath });
          select(editor, nextPath);
        }
      }
    }

    normalizeNode([node, path]);
  };

  editor = withRemoveEmptyNodes(
    getEditorPlugin(
      editor,
      RemoveEmptyNodesPlugin.configure({
        options: { types: type },
      })
    )
  );

  return editor;
};
