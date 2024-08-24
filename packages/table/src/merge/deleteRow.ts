import { findNodePath } from '@udecode/plate-common';
import {
  type PlateEditor,
  type Value,
  getAboveNode,
  getPluginOptions,
  getPluginType,
  insertElements,
  isExpanded,
  removeNodes,
  setNodes,
  someNode,
} from '@udecode/plate-common/server';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
  TablePlugin,
} from '../types';

import { ELEMENT_TABLE, ELEMENT_TR } from '../createTablePlugin';
import { getTableColumnCount } from '../queries';
import { getRowSpan } from '../queries/getRowSpan';
import { getCellTypes } from '../utils';
import { deleteRowWhenExpanded } from './deleteRowWhenExpanded';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellIndices } from './getCellIndices';
import { deleteTable } from '../transforms';

export const deleteTableMergeRow = <V extends Value>(
  editor: PlateEditor<V>
) => {
  if (
    someNode(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    })
  ) {
    const { _cellIndices: cellIndices } = getPluginOptions<TablePlugin, V>(
      editor,
      ELEMENT_TABLE
    );

    const currentTableItem = getAboveNode<TTableElement>(editor, {
      match: { type: getPluginType(editor, ELEMENT_TABLE) },
    });

    if (!currentTableItem) return;
    if (isExpanded(editor.selection))
      return deleteRowWhenExpanded(editor, currentTableItem);

    const table = currentTableItem[0] as TTableElement;

    const selectedCellEntry = getAboveNode(editor, {
      match: { type: getCellTypes(editor) },
    });

    if (!selectedCellEntry) return;

    const selectedCell = selectedCellEntry[0] as TTableCellElement;
    const { row: deletingRowIndex } = getCellIndices(
      cellIndices!,
      selectedCell
    )!;
    const rowsDeleteNumber = getRowSpan(selectedCell);
    const endingRowIndex = deletingRowIndex + rowsDeleteNumber - 1;

    const colNumber = getTableColumnCount(table);
    const affectedCellsSet = new Set();
    // iterating by columns is important here to keep the order of affected cells
    Array.from({ length: colNumber }, (_, i) => i).forEach((cI) => {
      return Array.from({ length: rowsDeleteNumber }, (_, i) => i).forEach(
        (rI) => {
          const rowIndex = deletingRowIndex + rI;
          const found = findCellByIndexes(editor, table, rowIndex, cI);
          affectedCellsSet.add(found);
        }
      );
    });
    const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

    const { moveToNextRowCells, squizeRowSpanCells } = affectedCells.reduce<{
      moveToNextRowCells: TTableCellElement[];
      squizeRowSpanCells: TTableCellElement[];
    }>(
      (acc, cur) => {
        if (!cur) return acc;

        const currentCell = cur as TTableCellElement;
        const { row: curRowIndex } = getCellIndices(cellIndices!, currentCell)!;
        const curRowSpan = getRowSpan(currentCell);

        // if (!curRowIndex || !curRowSpan) return acc;

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
      { moveToNextRowCells: [], squizeRowSpanCells: [] }
    );
    console.log(deletingRowIndex)
    alert(deletingRowIndex)
    const nextRowIndex = deletingRowIndex + rowsDeleteNumber;
    const nextRow = table.children[nextRowIndex] as
      | TTableCellElement
      | undefined;

    if (nextRow === undefined && deletingRowIndex === 0) {
      deleteTable(editor);

      return;
    }
    if (nextRow) {
      moveToNextRowCells.forEach((cur, index) => {
        const curRowCell = cur as TTableCellElement;
        const { col: curRowCellColIndex } = getCellIndices(
          cellIndices!,
          curRowCell
        )!;
        const curRowCellRowSpan = getRowSpan(curRowCell);

        // search for anchor cell where to place current cell
        const startingCellIndex = nextRow.children.findIndex((curC) => {
          const cell = curC as TTableCellElement;
          const { col: curColIndex } = getCellIndices(cellIndices!, cell)!;

          return curColIndex >= curRowCellColIndex;
        });

        const startingCell = nextRow.children[
          startingCellIndex
        ] as TTableCellElement;
        const { col: startingColIndex } = getCellIndices(
          cellIndices!,
          startingCell
        )!;

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
      const { row: curRowCellRowIndex } = getCellIndices(
        cellIndices!,
        curRowCell
      )!;
      const curRowCellRowSpan = getRowSpan(curRowCell);

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
