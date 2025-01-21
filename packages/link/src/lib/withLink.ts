import {
  type OverrideEditor,
  type Point,
  type TRange,
  PathApi,
  RangeApi,
} from '@udecode/plate';

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
export const withLink: OverrideEditor<BaseLinkConfig> = ({
  editor,
  getOptions,
  tf: { apply, insertBreak, insertData, insertText, normalizeNode },
  type,
}) => {
  const wrapLink = () => {
    const { getUrlHref, isUrl, rangeBeforeOptions } = getOptions();

    editor.tf.withoutNormalizing(() => {
      const selection = editor.selection!;

      // get the range from first space before the cursor
      let beforeWordRange = editor.api.range('before', selection, {
        before: rangeBeforeOptions,
      });

      // if no space found before, get the range from block start
      if (!beforeWordRange) {
        beforeWordRange = editor.api.range('start', editor.selection);
      }
      // if no word found before the cursor, exit
      if (!beforeWordRange) return;

      const hasLink = editor.api.some({
        at: beforeWordRange,
        match: { type },
      });

      // if word before the cursor has a link, exit
      if (hasLink) return;

      let beforeWordText = editor.api.string(beforeWordRange);
      beforeWordText = getUrlHref?.(beforeWordText) ?? beforeWordText;

      // if word before is not an url, exit
      if (!isUrl!(beforeWordText)) return;

      // select the word to wrap link
      editor.tf.select(beforeWordRange);

      // wrap link
      upsertLink(editor, {
        url: beforeWordText,
      });

      // collapse selection
      editor.tf.collapse({ edge: 'end' });
    });
  };

  return {
    transforms: {
      apply(operation) {
        if (operation.type === 'set_selection') {
          const range = operation.newProperties as TRange | null;

          if (range?.focus && range.anchor && RangeApi.isCollapsed(range)) {
            const entry = editor.api.above({
              at: range,
              match: { type },
            });

            if (entry) {
              const [, path] = entry;

              let newPoint: Point | undefined;

              if (editor.api.isStart(range.focus, path)) {
                newPoint = editor.api.end(path, { previous: true });
              }
              if (editor.api.isEnd(range.focus, path)) {
                newPoint = editor.api.start(path, { next: true });
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
      },

      insertBreak() {
        if (!editor.api.isCollapsed()) return insertBreak();

        wrapLink();
        insertBreak();
      },

      insertData(data) {
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
      },

      insertText(text, options) {
        if (text === ' ' && editor.api.isCollapsed()) {
          wrapLink();
        }

        insertText(text, options);
      },

      normalizeNode([node, path]) {
        if (node.type === type) {
          const range = editor.selection;

          if (
            range &&
            editor.api.isCollapsed() &&
            editor.api.isEnd(range.focus, path)
          ) {
            const nextPoint = editor.api.start(path, { next: true });

            // select next text node if any
            if (nextPoint) {
              editor.tf.select(nextPoint);
            } else {
              // insert text node then select
              const nextPath = PathApi.next(path);
              editor.tf.insertNodes({ text: '' } as any, { at: nextPath });
              editor.tf.select(nextPath);
            }
          }
        }

        normalizeNode([node, path]);
      },
    },
  };
};
