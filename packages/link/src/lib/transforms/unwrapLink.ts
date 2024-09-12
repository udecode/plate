import {
  type SlateEditor,
  type UnwrapNodesOptions,
  getAboveNode,
  isElement,
  splitNodes,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import { BaseLinkPlugin } from '../BaseLinkPlugin';

/** Unwrap link node. */
export const unwrapLink = (
  editor: SlateEditor,
  options?: {
    split?: boolean;
  } & UnwrapNodesOptions
) => {
  return withoutNormalizing(editor, () => {
    if (options?.split) {
      const linkAboveAnchor = getAboveNode(editor, {
        at: editor.selection?.anchor,
        match: { type: editor.getType(BaseLinkPlugin) },
      });

      // anchor in link
      if (linkAboveAnchor) {
        splitNodes(editor, {
          at: editor.selection?.anchor,
          match: (n) =>
            isElement(n) && n.type === editor.getType(BaseLinkPlugin),
        });
        unwrapLink(editor, {
          at: editor.selection?.anchor,
        });

        return true;
      }

      const linkAboveFocus = getAboveNode(editor, {
        at: editor.selection?.focus,
        match: { type: editor.getType(BaseLinkPlugin) },
      });

      // focus in link
      if (linkAboveFocus) {
        splitNodes(editor, {
          at: editor.selection?.focus,
          match: (n) =>
            isElement(n) && n.type === editor.getType(BaseLinkPlugin),
        });
        unwrapLink(editor, {
          at: editor.selection?.focus,
        });

        return true;
      }
    }

    unwrapNodes(editor, {
      match: { type: editor.getType(BaseLinkPlugin) },
      ...options,
    });
  });
};
