import {
  type Editor,
  type TNodeEntry,
  isDefined,
} from '@udecode/plate-common';

import { INDENT_LIST_KEYS } from '../BaseIndentListPlugin';

/**
 * If there is no previous list item and node list start is defined, unset list
 * start (1).
 */
export const normalizeFirstIndentListStart = (
  editor: Editor,
  [node, path]: TNodeEntry
) => {
  if (isDefined(node[INDENT_LIST_KEYS.listStart])) {
    editor.tf.unsetNodes(INDENT_LIST_KEYS.listStart, { at: path });

    return true;
  }
};
