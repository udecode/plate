import { type Editor, type NodeEntry, isDefined } from '@udecode/plate';

import { INDENT_LIST_KEYS } from '../BaseIndentListPlugin';

/**
 * If there is no previous list item and node list start is defined, unset list
 * start (1).
 */
export const normalizeFirstIndentListStart = (
  editor: Editor,
  [node, path]: NodeEntry
) => {
  if (isDefined(node[INDENT_LIST_KEYS.listStart])) {
    editor.tf.unsetNodes(INDENT_LIST_KEYS.listStart, { at: path });

    return true;
  }
};
