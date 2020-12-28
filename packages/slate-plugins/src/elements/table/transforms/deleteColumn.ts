import {
  getAboveByType,
  isNodeTypeIn,
  setDefaults,
} from "@udecode/slate-plugins-common";
import { Editor, Transforms } from "slate";
import { DEFAULTS_TABLE } from "../defaults";
import { TableOptions } from "../types";

export const deleteColumn = (editor: Editor, options?: TableOptions) => {
  const { table, tr, td, th } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
    const currentCellItem = getAboveByType(editor, [td.type, th.type]);
    const currentRowItem = getAboveByType(editor, tr.type);
    const currentTableItem = getAboveByType(editor, table.type);

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
