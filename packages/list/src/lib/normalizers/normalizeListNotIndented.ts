import { type Editor, type NodeEntry, isDefined, KEYS } from '@udecode/plate';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';

/** Unset listStyle, listStart if KEYS.indent is not defined. */
export const normalizeListNotIndented = (
  editor: Editor,
  [node, path]: NodeEntry
) => {
  if (
    !isDefined(node[KEYS.indent]) &&
    (node[INDENT_LIST_KEYS.listStyleType] || node[INDENT_LIST_KEYS.listStart])
  ) {
    editor.tf.unsetNodes(
      [INDENT_LIST_KEYS.listStyleType, INDENT_LIST_KEYS.listStart],
      {
        at: path,
      }
    );

    return true;
  }
};
