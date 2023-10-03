// Unmerges previously merged cell into individual cells.
import {
  insertElements,
  PlateEditor,
  removeNodes,
  TDescendant,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';

import { getTableGridAbove } from '../queries';
import { getEmptyCellNode } from '../utils';

export const unmergeTableCells = <V extends Value = Value>(
  editor: PlateEditor<V>
) => {
  withoutNormalizing(editor, () => {
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

    const [[cellElem, path]] = cellEntries;

    // creating new object per iteration is essential here
    const createEmptyCell = (children?: TDescendant[]) => {
      return {
        ...getEmptyCellNode(editor, {
          header: cellElem.type === 'th',
          newCellChildren: children,
        }),
        colSpan: 1,
        rowSpan: 1,
      };
    };

    const tablePath = path.slice(0, -2);

    const cellPath = path.slice(-2);
    const [rowPath, colPath] = cellPath;
    const colSpan = cellElem.colSpan as number;
    const rowSpan = cellElem.rowSpan as number;

    // Generate an array of column paths from the colspan
    const colPaths: number[] = [];
    for (let i = 0; i < colSpan; i++) {
      colPaths.push(colPath + i);
    }

    // Remove the original merged cell from the editor
    removeNodes(editor, { at: path });

    // Generate an array of cell paths from the row and col spans and then insert empty cells at those paths
    for (let i = 0; i < rowSpan; i++) {
      const currentRowPath = rowPath + i;
      for (let j = 0; j < colPaths.length; j++) {
        const currentColPath = colPaths[j];
        const pathForNewCell = [...tablePath, currentRowPath, currentColPath];
        const cellToInsert =
          i === 0 && j === 0
            ? createEmptyCell(cellElem.children)
            : createEmptyCell();
        insertElements(editor, cellToInsert, { at: pathForNewCell });
      }
    }
  });
};
