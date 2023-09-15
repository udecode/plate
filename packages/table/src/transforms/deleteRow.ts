import {
  findNodePath,
  getAboveNode,
  getPluginType,
  insertElements,
  PlateEditor,
  removeNodes,
  setNodes,
  someNode,
  Value,
} from '@udecode/plate-common';

import { ELEMENT_TABLE } from '../createTablePlugin';
import { getTableColumnCount } from '../queries';
import { TTableCellElement, TTableElement, TTableRowElement } from '../types';
import { findCellByIndexes, getCellTypes } from '../utils';

export const deleteRow = <V extends Value>(editor: PlateEditor<V>) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const currentTableItem = getAboveNode<TTableElement>(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });
    if (!currentTableItem) return;
    const table = currentTableItem[0] as TTableElement;

    const selectedCellEntry = getAboveNode(editor, {
      match: { type: getCellTypes(editor) },
    });
    if (!selectedCellEntry) return;

    const selectedCell = selectedCellEntry[0] as TTableCellElement;
    const deletingRowIndex = selectedCell.rowIndex!;
    const rowsDeleteNumber = selectedCell.rowSpan!;
    const endingRowIndex = deletingRowIndex + rowsDeleteNumber - 1;

    const colNumber = getTableColumnCount(table);
    const affectedCellsSet = new Set();
    // iterating by columns is important here to keep the order of affected cells
    Array.from({ length: colNumber }, (_, i) => i).forEach((cI) => {
      return Array.from({ length: rowsDeleteNumber }, (_, i) => i).forEach(
        (rI) => {
          const rowIndex = deletingRowIndex + rI;
          const found = findCellByIndexes(table, rowIndex, cI);
          affectedCellsSet.add(found);
        }
      );
    });
    const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

    const { moveToNextRowCells, squizeRowSpanCells } = affectedCells.reduce<{
      squizeRowSpanCells: TTableCellElement[];
      moveToNextRowCells: TTableCellElement[];
    }>(
      (acc, cur) => {
        if (!cur) return acc;

        const currentCell = cur as TTableCellElement;

        const curRowIndex = currentCell.rowIndex;
        const curRowSpan = currentCell.rowSpan;
        if (!curRowIndex || !curRowSpan) return acc;

        if (curRowIndex < deletingRowIndex && curRowSpan > 1) {
          acc.squizeRowSpanCells.push(currentCell);
        } else if (
          curRowSpan > 1 &&
          curRowIndex + curRowSpan - 1 > endingRowIndex
        ) {
          acc.moveToNextRowCells.push(currentCell);
        }

        return acc;
      },
      { squizeRowSpanCells: [], moveToNextRowCells: [] }
    );

    const nextRowIndex = deletingRowIndex + rowsDeleteNumber;
    const nextRow = table.children[nextRowIndex] as
      | TTableCellElement
      | undefined;

    if (nextRow) {
      moveToNextRowCells.forEach((cur, index) => {
        const curRowCell = cur as TTableCellElement;
        const curRowCellColIndex = curRowCell.colIndex!;
        const curRowCellRowSpan = curRowCell.rowSpan!;

        // search for anchor cell where to place current cell
        const startingCellIndex = nextRow.children.findIndex((curC) => {
          const cell = curC as TTableCellElement;
          const curColIndex = cell.colIndex!;
          return curColIndex >= curRowCellColIndex;
        });
        const startingCell = nextRow.children[
          startingCellIndex
        ] as TTableCellElement;

        const startingColIndex = startingCell.colIndex!;
        // consider already inserted cell by adding index each time to the col path
        let incrementBy = index;
        if (startingColIndex < curRowCellColIndex) {
          // place current cell after starting cell, if placing cell col index is grather than col index of starting cell
          incrementBy += 1;
        }

        const startingCellPath = findNodePath(editor, startingCell)!;
        const tablePath = startingCellPath.slice(0, -2);
        const colPath = startingCellPath.at(-1)!;

        const nextRowStartCellPath = [
          ...tablePath,
          nextRowIndex,
          colPath + incrementBy,
        ];

        const rowsNumberAffected = endingRowIndex - curRowCellColIndex + 1;

        // TODO: consider make deep clone here
        // making cell smaller and moving it to next row
        const newCell = {
          ...curRowCell,
          rowSpan: curRowCellRowSpan - rowsNumberAffected,
        };
        insertElements(editor, newCell, { at: nextRowStartCellPath });
      });
    }

    squizeRowSpanCells.forEach((cur) => {
      const curRowCell = cur as TTableCellElement;
      const curRowCellRowIndex = curRowCell.rowIndex!;
      const curRowCellRowSpan = curRowCell.rowSpan!;
      const curCellPath = findNodePath(editor, curRowCell)!;

      const curCellEndingRowIndex = Math.min(
        curRowCellRowIndex + curRowCellRowSpan - 1,
        endingRowIndex
      );
      const rowsNumberAffected = curCellEndingRowIndex - deletingRowIndex + 1;

      setNodes<TTableCellElement>(
        editor,
        { ...curRowCell, rowSpan: curRowCellRowSpan - rowsNumberAffected },
        { at: curCellPath }
      );
    });

    const rowToDelete = table.children[deletingRowIndex] as TTableRowElement;
    const rowPath = findNodePath(editor, rowToDelete);
    Array.from({ length: rowsDeleteNumber }).forEach(() => {
      removeNodes(editor, {
        at: rowPath,
      });
    });
  }
};
