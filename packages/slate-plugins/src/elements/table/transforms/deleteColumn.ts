import { getAbove, someNode } from '@udecode/slate-plugins-common';
import { SlatePluginsOptions } from '@udecode/slate-plugins-core';
import { Editor, Transforms } from 'slate';

export const deleteColumn = (editor: Editor, options: SlatePluginsOptions) => {
  const { table, tr, td, th } = options;

  if (someNode(editor, { match: { type: table.type } })) {
    const currentCellItem = getAbove(editor, {
      match: { type: [td.type, th.type] },
    });
    const currentRowItem = getAbove(editor, { match: { type: tr.type } });
    const currentTableItem = getAbove(editor, { match: { type: table.type } });

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
