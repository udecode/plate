import {
  isCollapsed,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/slate-plugins-common';
import { getPluginType } from '@udecode/slate-plugins-core';
import { Editor } from 'slate';
import { ELEMENT_LI } from '../defaults';

/**
 * Is selection across blocks with list items
 */
export const isAcrossListItems = (editor: Editor) => {
  const { selection } = editor;

  if (!selection || isCollapsed(selection)) {
    return false;
  }

  const isAcrossBlocks = isRangeAcrossBlocks(editor);
  if (!isAcrossBlocks) return false;

  return someNode(editor, {
    match: { type: getPluginType(editor, ELEMENT_LI) },
  });
};
