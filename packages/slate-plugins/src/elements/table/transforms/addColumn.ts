import { Editor, Path, Transforms } from 'slate';
import { getAboveByType, isNodeTypeIn } from '../../../common/queries';
import { setDefaults } from '../../../common/utils/setDefaults';
import { DEFAULTS_TABLE } from '../defaults';
import { TableOptions } from '../types';
import { getEmptyCellNode } from '../utils';

export const addColumn = (editor: Editor, options?: TableOptions) => {
  const { table, td, th } = setDefaults(options, DEFAULTS_TABLE);

  if (isNodeTypeIn(editor, table.type)) {
    const currentCellItem = getAboveByType(editor, [td.type, th.type]);

    const currentTableItem = getAboveByType(editor, table.type);

    if (currentCellItem && currentTableItem) {
      const nextCellPath = Path.next(currentCellItem[1]);
      const newCellPath = nextCellPath.slice();
      const replacePathPos = newCellPath.length - 2;
      const currentRowIdx = nextCellPath[replacePathPos];

      currentTableItem[0].children.forEach((row, rowIdx) => {
        newCellPath[replacePathPos] = rowIdx;

        Transforms.insertNodes(
          editor,
          getEmptyCellNode({ ...options, header: !rowIdx }),
          {
            at: newCellPath,
            select: rowIdx === currentRowIdx,
          }
        );
      });
    }
  }
};
