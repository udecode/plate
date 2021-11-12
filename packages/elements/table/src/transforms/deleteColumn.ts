import { getAbove, someNode } from '@udecode/plate-common';
import { getPluginType, PlateEditor } from '@udecode/plate-core';
import { Transforms } from 'slate';
import { ELEMENT_TABLE, ELEMENT_TD, ELEMENT_TH, ELEMENT_TR } from '../defaults';

export const deleteColumn = (editor: PlateEditor) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentCellItem = getAbove(editor, {
      match: {
        type: [
          getPluginType(editor, ELEMENT_TD),
          getPluginType(editor, ELEMENT_TH),
        ],
      },
    });
    const currentRowItem = getAbove(editor, {
      match: { type: getPluginType(editor, ELEMENT_TR) },
    });
    const currentTableItem = getAbove(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });

    if (
      currentCellItem &&
      currentRowItem &&
      currentTableItem &&
      // Cannot delete the last cell
      currentRowItem[0].children.length > 1
    ) {
      const currentCellPath = currentCellItem[1];
      const pathToDelete = currentCellPath.slice();
      const replacePathPos = pathToDelete.length - 2;

      currentTableItem[0].children.forEach((row, rowIdx) => {
        pathToDelete[replacePathPos] = rowIdx;

        Transforms.removeNodes(editor, {
          at: pathToDelete,
        });
      });
    }
  }
};
