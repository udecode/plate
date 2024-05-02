import {
  getAboveNode,
  getPluginType,
  isElement,
  PlateEditor,
  splitNodes,
  unwrapNodes,
  UnwrapNodesOptions,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import { ELEMENT_LINK } from '../createLinkPlugin';

/**
 * Unwrap link node.
 */
export const unwrapLink = <V extends Value>(
  editor: PlateEditor<V>,
  options?: UnwrapNodesOptions & {
    split?: boolean;
  }
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
