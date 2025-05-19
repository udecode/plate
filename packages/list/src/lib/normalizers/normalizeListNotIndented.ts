import { type Editor, type NodeEntry, isDefined } from '@udecode/plate';
import { BaseIndentPlugin } from '@udecode/plate-indent';

import { INDENT_LIST_KEYS } from '../BaseListPlugin';

/** Unset listStyle, listStart if BaseIndentPlugin.key is not defined. */
export const normalizeListNotIndented = (
  editor: Editor,
  [node, path]: NodeEntry
) => {
  if (
    !isDefined(node[BaseIndentPlugin.key]) &&
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
