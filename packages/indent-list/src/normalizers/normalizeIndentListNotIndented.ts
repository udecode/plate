import {
  type TEditor,
  type TNodeEntry,
  isDefined,
  unsetNodes,
} from '@udecode/plate-common';
import { IndentPlugin } from '@udecode/plate-indent';

import { KEY_LIST_START, IndentListPlugin } from '../IndentListPlugin';

/** Unset IndentListPlugin.key, KEY_LIST_START if IndentPlugin.key is not defined. */
export const normalizeIndentListNotIndented = (
  editor: TEditor,
  [node, path]: TNodeEntry
) => {
  if (
    !isDefined(node[IndentPlugin.key]) &&
    (node[IndentListPlugin.key] || node[KEY_LIST_START])
  ) {
    unsetNodes(editor, [IndentListPlugin.key, KEY_LIST_START], { at: path });

    return true;
  }
};
