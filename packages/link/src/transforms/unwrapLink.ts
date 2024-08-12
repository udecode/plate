import {
  type PlateEditor,
  type UnwrapNodesOptions,
  getAboveNode,
  getPluginType,
  isElement,
  splitNodes,
  unwrapNodes,
  withoutNormalizing,
} from '@udecode/plate-common';

import { ELEMENT_LINK } from '../LinkPlugin';

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
        match: { type: getPluginType(editor, ELEMENT_LINK) },
      });

      // anchor in link
      if (linkAboveAnchor) {
        splitNodes(editor, {
          at: editor.selection?.anchor,
          match: (n) =>
            isElement(n) && n.type === getPluginType(editor, ELEMENT_LINK),
        });
        unwrapLink(editor, {
          at: editor.selection?.anchor,
        });

        return true;
      }

      const linkAboveFocus = getAboveNode(editor, {
        at: editor.selection?.focus,
        match: { type: getPluginType(editor, ELEMENT_LINK) },
      });

      // focus in link
      if (linkAboveFocus) {
        splitNodes(editor, {
          at: editor.selection?.focus,
          match: (n) =>
            isElement(n) && n.type === getPluginType(editor, ELEMENT_LINK),
        });
        unwrapLink(editor, {
          at: editor.selection?.focus,
        });

        return true;
      }
    }

    unwrapNodes(editor, {
      match: { type: getPluginType(editor, ELEMENT_LINK) },
      ...options,
    });
  });
};
