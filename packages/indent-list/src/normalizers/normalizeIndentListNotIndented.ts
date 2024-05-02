import {
  isDefined,
  TEditor,
  TNodeEntry,
  unsetNodes,
  Value,
} from '@udecode/plate-common/server';
import { KEY_INDENT } from '@udecode/plate-indent';

import { KEY_LIST_START, KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';

/**
 * Unset KEY_LIST_STYLE_TYPE, KEY_LIST_START if KEY_INDENT is not defined.
 */
export const normalizeIndentListNotIndented = <V extends Value>(
  editor: TEditor<V>,
  [node, path]: TNodeEntry
) => {
  if (
    !isDefined(node[KEY_INDENT]) &&
    (node[KEY_LIST_STYLE_TYPE] || node[KEY_LIST_START])
  ) {
    unsetNodes(editor, [KEY_LIST_STYLE_TYPE, KEY_LIST_START], { at: path });
    return true;
  }
};
