import { type OverrideEditor, PathApi, PointApi, TextApi } from 'platejs';
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
          const focus = editor.selection?.focus;
          const focusEntry = focus ? editor.api.node(focus.path) : undefined;
          const focusIsValid =
            !!focusEntry &&
            (!TextApi.isText(focusEntry[0]) ||
              (focus?.offset ?? 0) <= focusEntry[0].text.length);
          const endPoint = editor.api.end(path);

          if (
            focus &&
            editor.api.isCollapsed() &&
            focusIsValid &&
            endPoint &&
            PointApi.equals(focus, endPoint)
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
