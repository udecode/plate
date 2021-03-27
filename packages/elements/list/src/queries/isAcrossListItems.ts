import {
  isCollapsed,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/slate-plugins-common';
import { getSlatePluginType, SPEditor } from '@udecode/slate-plugins-core';
import { ELEMENT_LI } from '../defaults';

/**
 * Is selection across blocks with list items
 */
export const isAcrossListItems = (editor: SPEditor) => {
  const { selection } = editor;

  if (!selection || isCollapsed(selection)) {
    return false;
  }

  const isAcrossBlocks = isRangeAcrossBlocks(editor);
  if (!isAcrossBlocks) return false;

  return someNode(editor, {
    match: { type: getSlatePluginType(editor, ELEMENT_LI) },
  });
};
