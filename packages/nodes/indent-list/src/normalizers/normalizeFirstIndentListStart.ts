import { isDefined, TEditor, unsetNodes } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { KEY_LIST_START } from '../createIndentListPlugin';

/**
 * If there is no previous list item and node list start is defined, unset list start (1).
 */
export const normalizeFirstIndentListStart = (
  editor: TEditor,
  [node, path]: NodeEntry
) => {
  if (isDefined(node[KEY_LIST_START])) {
    unsetNodes(editor, KEY_LIST_START, { at: path });
    return true;
  }
};
