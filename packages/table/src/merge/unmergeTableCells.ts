import {
  findNode,
  getPluginOptions,
  getPluginType,
  insertElements,
  PlateEditor,
  removeNodes,
  TDescendant,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';

import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';
import { getTableGridAbove } from '../queries';
import { getColSpan } from '../queries/getColSpan';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';
import { getEmptyCellNode } from '../utils';

export const unmergeTableCells = <V extends Value = Value>(
  editor: PlateEditor<V>
) => {
  withoutNormalizing(editor, () => {
    const options = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

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

    const { col } = options._cellIndices.get(cellElem as TTableCellElement)!;

    const getColPathForRow = (row: number) => {
      let newColPath = 0;

      const rowEntry = findNode(editor, {
        at: [...tablePath, row],
        match: { type: getPluginType(editor, ELEMENT_TR) },
      })!; // TODO: improve typing
      const rowEl = rowEntry[0] as TTableRowElement;

      for (const item of rowEl.children) {
        const { col: c } = options._cellIndices.get(item as TTableCellElement)!;
        if (c === col - 1) {
          newColPath = rowEl.children.indexOf(item) + 1;
          // console.log('found first', newColPath);
          break;
        }
        if (col + getColSpan(cellElem as TTableCellElement) === c - 1) {
          newColPath = rowEl.children.indexOf(item);
          // console.log('found last', newColPath);
          break;
        }
      }

      return newColPath;
    };

    // Generate an array of cell paths from the row and col spans and then insert empty cells at those paths
    for (let i = 0; i < rowSpan; i++) {
      const currentRowPath = rowPath + i;
      const pathForNextRows = getColPathForRow(currentRowPath);
      for (let j = 0; j < colPaths.length; j++) {
        const currentColPath = i === 0 ? colPaths[j] : pathForNextRows;

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
