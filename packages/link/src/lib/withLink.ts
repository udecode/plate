import { type OverrideEditor, PathApi } from 'platejs';
import type { TText } from 'platejs';

import type { BaseLinkConfig } from './BaseLinkPlugin';

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
  tf: { normalizeNode },
  type,
}) => {
  return {
    transforms: {
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
            if (!nextPoint) {
              const nextPath = PathApi.next(path);
              editor.tf.insertNodes({ text: '' } as TText, { at: nextPath });
              editor.tf.select(nextPath);
            }
          }
        }

        normalizeNode([node, path]);
      },
    },
  };
};
