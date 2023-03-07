import {
  getPluginType,
  isCollapsed,
  isRangeAcrossBlocks,
  PlateEditor,
  someNode,
  Value,
} from '@udecode/plate-common';
import { ELEMENT_LI } from '../createListPlugin';

/**
 * Is selection across blocks with list items
 */
export const isAcrossListItems = <V extends Value>(editor: PlateEditor<V>) => {
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
