import { TEditor, unsetNodes } from '@udecode/plate-core';
import { KEY_INDENT } from '@udecode/plate-indent';
import { NodeEntry } from 'slate';
import { KEY_LIST_START, KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';

/**
 * Unset KEY_LIST_STYLE_TYPE, KEY_LIST_START if KEY_INDENT is not defined.
 */
export const normalizeIndentListNotIndented = (
  editor: TEditor,
  [node, path]: NodeEntry
) => {
  if (
    !node[KEY_INDENT] &&
    (node[KEY_LIST_STYLE_TYPE] || node[KEY_LIST_START])
  ) {
    unsetNodes(editor, [KEY_LIST_STYLE_TYPE, KEY_LIST_START], { at: path });
    return true;
  }
};
