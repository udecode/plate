import type { OverrideEditor } from '@udecode/plate';

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
  tf: { insertBreak, insertData, insertText },
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
    },
  };
};
