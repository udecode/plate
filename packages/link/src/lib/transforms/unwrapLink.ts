import {
  type SlateEditor,
  type UnwrapNodesOptions,
  ElementApi,
} from '@udecode/plate';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

/** Unwrap link node. */
export const unwrapLink = (
  editor: SlateEditor,
  options?: {
    split?: boolean;
  } & UnwrapNodesOptions
) => {
  return editor.tf.withoutNormalizing(() => {
    if (options?.split) {
      const linkAboveAnchor = editor.api.above({
        at: editor.selection?.anchor,
        match: { type: editor.getType(BaseLinkPlugin) },
      });

      // anchor in link
      if (linkAboveAnchor) {
        editor.tf.splitNodes({
          at: editor.selection?.anchor,
          match: (n) =>
            ElementApi.isElement(n) &&
            n.type === editor.getType(BaseLinkPlugin),
        });
        unwrapLink(editor, {
          at: editor.selection?.anchor,
        });

        return true;
      }

      const linkAboveFocus = editor.api.above({
        at: editor.selection?.focus,
        match: { type: editor.getType(BaseLinkPlugin) },
      });

      // focus in link
      if (linkAboveFocus) {
        editor.tf.splitNodes({
          at: editor.selection?.focus,
          match: (n) =>
            ElementApi.isElement(n) &&
            n.type === editor.getType(BaseLinkPlugin),
        });
        unwrapLink(editor, {
          at: editor.selection?.focus,
        });

        return true;
      }
    }

    editor.tf.unwrapNodes({
      match: { type: editor.getType(BaseLinkPlugin) },
      ...options,
    });
  });
};
