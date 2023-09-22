import {
  getAboveNode,
  getPluginType,
  insertElements,
  PlateEditor,
  removeNodes,
  setNodes,
  someNode,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';
import { getTableColumnCount } from '../queries';
import { TTableCellElement, TTableElement, TTableRowElement } from '../types';
import { findCellByIndexes, getCellTypes } from '../utils';
import { getCellPath } from '../utils/getCellPath';

export const deleteColumn = <V extends Value>(editor: PlateEditor<V>) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const tableEntry = getAboveNode<TTableElement>(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });
    if (!tableEntry) return;
    const table = tableEntry[0] as TTableElement;

    const selectedCellEntry = getAboveNode(editor, {
      match: {
        type: getCellTypes(editor),
      },
    });
    if (!selectedCellEntry) return;
    const selectedCell = selectedCellEntry[0] as TTableCellElement;

    const deletingColIndex = selectedCell.colIndex!;
    const colsDeleteNumber = selectedCell.colSpan!;
    const endingColIndex = deletingColIndex + colsDeleteNumber - 1;

    const rowNumber = table.children.length;
    const affectedCellsSet = new Set();
    // iterating by rows is important here to keep the order of affected cells
    Array.from({ length: rowNumber }, (_, i) => i).forEach((rI) => {
      return Array.from({ length: colsDeleteNumber }, (_, i) => i).forEach(
        (cI) => {
          const colIndex = deletingColIndex + cI;
          const found = findCellByIndexes(table, rI, colIndex);
          if (found) {
            affectedCellsSet.add(found);
          }
        }
      );
    });
    const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

    const { moveToNextColCells, squizeColSpanCells } = affectedCells.reduce<{
      squizeColSpanCells: TTableCellElement[];
      moveToNextColCells: TTableCellElement[];
    }>(
      (acc, cur) => {
        if (!cur) return acc;

        const currentCell = cur as TTableCellElement;
        const curColIndex = currentCell.colIndex!;
        const curColSpan = currentCell.colSpan!;

        if (curColIndex < deletingColIndex && curColSpan > 1) {
          acc.squizeColSpanCells.push(currentCell);
        } else if (
          curColSpan > 1 &&
          curColIndex + curColSpan - 1 > endingColIndex
        ) {
          acc.moveToNextColCells.push(currentCell);
        }
        return acc;
      },
      { moveToNextColCells: [], squizeColSpanCells: [] }
    );

    const nextColIndex = deletingColIndex + colsDeleteNumber;
    const colNumber = getTableColumnCount(table);
    if (colNumber > nextColIndex) {
      moveToNextColCells.forEach((cur) => {
        const curCell = cur as TTableCellElement;
        const curRowIndex = curCell.rowIndex!;
        const curColIndex = curCell.colIndex!;
        const curColSpan = curCell.colSpan!;

        // simplify logic here. use getParent
        const curRow = table.children[curRowIndex] as TTableRowElement;
        const startingCellIndex = curRow.children.findIndex((curC) => {
          const cell = curC as TTableCellElement;
          return cell.colIndex! >= curColIndex + 1;
        });

        const startingCell = curRow.children.at(
          startingCellIndex
        ) as TTableCellElement;
        const startingCellPath = getCellPath(tableEntry, startingCell);
        const colsNumberAffected = endingColIndex - curColIndex + 1;

        const newCell = {
          ...curCell,
          colSpan: curColSpan - colsNumberAffected,
        };
        insertElements(editor, newCell, { at: startingCellPath });
      });
    }

    squizeColSpanCells.forEach((cur) => {
      const curCell = cur as TTableCellElement;
      const curColIndex = curCell.colIndex!;
      const curColSpan = curCell.colSpan!;

      const curCellPath = getCellPath(tableEntry, curCell);

      const curCellEndingColIndex = Math.min(
        curColIndex + curColSpan - 1,
        endingColIndex
      );
      const colsNumberAffected = curCellEndingColIndex - deletingColIndex + 1;

      setNodes<TTableCellElement>(
        editor,
        { ...curCell, colSpan: curColSpan - colsNumberAffected },
        { at: curCellPath }
      );
    });

    const trEntry = getAboveNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TR) },
    });

    if (
      selectedCell &&
      trEntry &&
      tableEntry &&
      // Cannot delete the last cell
      trEntry[0].children.length > 1
    ) {
      const [tableNode, tablePath] = tableEntry;

      // calc paths to delete
      const paths: Array<Path[]> = [];
      affectedCells.forEach((cur) => {
        const curCell = cur as TTableCellElement;
        const curColIndex = curCell.colIndex!;
        const curRowIndex = curCell.rowIndex!;

        if (curColIndex >= deletingColIndex && curColIndex <= endingColIndex) {
          const cellPath = getCellPath(tableEntry, curCell);

          if (!paths[curRowIndex]) {
            paths[curRowIndex] = [];
          }
          paths[curRowIndex].push(cellPath);
        }
      });

      withoutNormalizing(editor, () => {
        paths.forEach((cellPaths) => {
          const pathToDelete = cellPaths[0];
          cellPaths.forEach(() => {
            removeNodes(editor, {
              at: pathToDelete,
            });
          });
        });

        const { colSizes } = tableNode;
        if (colSizes) {
          const newColSizes = [...colSizes];
          newColSizes.splice(deletingColIndex, 1);

          setNodes<TTableElement>(
            editor,
            { colSizes: newColSizes },
            { at: tablePath }
          );
        }
      });
    }
  }
};
