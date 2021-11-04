import {
  isCollapsed,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/plate-common';
import {
  getPlatePluginType,
  PlateEditor,
  TPlateEditor,
} from '@udecode/plate-core';
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
    match: { type: getPlatePluginType(editor, ELEMENT_LI) },
  });
};
