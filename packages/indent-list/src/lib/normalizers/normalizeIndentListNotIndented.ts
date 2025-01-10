import { type Editor, type NodeEntry, isDefined } from '@udecode/plate';
import { BaseIndentPlugin } from '@udecode/plate-indent';

import {
  BaseIndentListPlugin,
  INDENT_LIST_KEYS,
} from '../BaseIndentListPlugin';

/** Unset IndentListPlugin.key, listStart if BaseIndentPlugin.key is not defined. */
export const normalizeIndentListNotIndented = (
  editor: Editor,
  [node, path]: NodeEntry
) => {
  if (
    !isDefined(node[BaseIndentPlugin.key]) &&
    (node[BaseIndentListPlugin.key] || node[INDENT_LIST_KEYS.listStart])
  ) {
    editor.tf.unsetNodes(
      [BaseIndentListPlugin.key, INDENT_LIST_KEYS.listStart],
      {
        at: path,
      }
    );

    return true;
  }
};
