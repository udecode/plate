import {
  type PlateEditor,
  type UnwrapNodesOptions,
  getAboveNode,
  isElement,
  splitNodes,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import { LinkPlugin } from '../LinkPlugin';

/** Unwrap link node. */
export const unwrapLink = (
  editor: PlateEditor,
  options?: {
    split?: boolean;
  } & UnwrapNodesOptions
) => {
  return withoutNormalizing(editor, () => {
    if (options?.split) {
      const linkAboveAnchor = getAboveNode(editor, {
        at: editor.selection?.anchor,
        match: { type: editor.getType(LinkPlugin) },
      });

      // anchor in link
      if (linkAboveAnchor) {
        splitNodes(editor, {
          at: editor.selection?.anchor,
          match: (n) => isElement(n) && n.type === editor.getType(LinkPlugin),
        });
        unwrapLink(editor, {
          at: editor.selection?.anchor,
        });

        return true;
      }

      const linkAboveFocus = getAboveNode(editor, {
        at: editor.selection?.focus,
        match: { type: editor.getType(LinkPlugin) },
      });

      // focus in link
      if (linkAboveFocus) {
        splitNodes(editor, {
          at: editor.selection?.focus,
          match: (n) => isElement(n) && n.type === editor.getType(LinkPlugin),
        });
        unwrapLink(editor, {
          at: editor.selection?.focus,
        });

        return true;
      }
    }

    unwrapNodes(editor, {
      match: { type: editor.getType(LinkPlugin) },
      ...options,
    });
  });
};
