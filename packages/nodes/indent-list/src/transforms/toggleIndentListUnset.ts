import { TEditor, unsetNodes } from '@udecode/plate-core';
import { NodeEntry } from 'slate';
import { KEY_LIST_STYLE_TYPE } from '../createIndentListPlugin';
import { ListStyleType } from '../types';

/**
 * Unset list style type if already set.
 */
export const toggleIndentListUnset = (
  editor: TEditor,
  [node]: NodeEntry,
  {
    listStyleType = ListStyleType.Disc,
  }: {
    listStyleType?: string;
  }
) => {
  if (listStyleType === node[KEY_LIST_STYLE_TYPE]) {
    unsetNodes(editor, KEY_LIST_STYLE_TYPE);
    return true;
  }
};
