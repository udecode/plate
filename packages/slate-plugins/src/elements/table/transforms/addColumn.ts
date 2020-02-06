import { Editor, Path, Transforms } from 'slate';
import { isSelectionInTable, isTable, isTableCell } from '../queries';
import { emptyCell } from '../types';

export const addColumn = (editor: Editor) => {
  if (isSelectionInTable(editor)) {
    const currentCellItem = Editor.above(editor, {
      match: isTableCell,
    });
    const currentTableItem = Editor.above(editor, {
      match: isTable,
    });
    if (currentCellItem && currentTableItem) {
      const nextCellPath = Path.next(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      currentTableItem[0].children.forEach((row, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        Transforms.insertNodes(editor, emptyCell(), {
          at: newCellPath,
          select: rowIdx === currentRowIdx,
        });
      });
    }
  }
};
