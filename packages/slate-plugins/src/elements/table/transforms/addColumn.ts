import { Editor, Path, Transforms } from 'slate';
import { isNodeInSelection } from '../../../common/queries';
import { isTable, isTableCell } from '../queries';
import { defaultTableTypes } from '../types';
import { getEmptyCellNode } from '../utils';

export const addColumn = (editor: Editor, options = defaultTableTypes) => {
  if (isNodeInSelection(editor, options.typeTable)) {
    const currentCellItem = Editor.above(editor, {
      match: isTableCell(options),
    });
    const currentTableItem = Editor.above(editor, {
      match: isTable(options),
    });
    if (currentCellItem && currentTableItem) {
      const nextCellPath = Path.next(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      currentTableItem[0].children.forEach((row, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        Transforms.insertNodes(editor, getEmptyCellNode(options), {
          at: newCellPath,
          select: rowIdx === currentRowIdx,
        });
      });
    }
  }
};
