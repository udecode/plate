import {
  type PlateEditor,
  isCollapsed,
  isRangeAcrossBlocks,
  someNode,
} from '@udecode/plate-common';

import { ListItemPlugin } from '../ListPlugin';

/** Is selection across blocks with list items */
export const isAcrossListItems = (editor: PlateEditor) => {
  const { selection } = editor;

  if (!selection || isCollapsed(selection)) {
    return false;
  }

  const isAcrossBlocks = isRangeAcrossBlocks(editor);

  if (!isAcrossBlocks) return false;

  return someNode(editor, {
    match: { type: editor.getType(ListItemPlugin) },
  });
};
