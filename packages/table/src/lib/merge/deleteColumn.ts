import type { EditorUpdateTransaction, Path } from '@platejs/plite';
import type { BaseEditor } from '@platejs/core';
import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

import cloneDeep from 'lodash/cloneDeep.js';
import { getEditorPlugin } from '@platejs/core';
import { KEYS } from '@platejs/utils';

import { getCellIndices, getCellTypes } from '..';
import { BaseTablePlugin } from '../BaseTablePlugin';
import { deleteColumnWhenExpanded } from './deleteColumnWhenExpanded';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellPath } from './getCellPath';
import { getTableMergedColumnCount } from './getTableMergedColumnCount';

export const deleteTableMergeColumn = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction
) => {
  const type = editor.getType(KEYS.table);
  const tableEntry = editor.read.nodes.above<TTableElement>({
    match: { type },
  });

  if (!tableEntry) return;

  const { api } = getEditorPlugin(editor, BaseTablePlugin);

  if (editor.read.selection.isExpanded()) {
    return deleteColumnWhenExpanded(editor, tx, tableEntry);
  }

  const table = tableEntry[0] as TTableElement;

  const selectedCellEntry = editor.read.nodes.above({
    match: {
      type: getCellTypes(editor),
    },
  });

  if (!selectedCellEntry) return;

  const selectedCell = selectedCellEntry[0] as TTableCellElement;

  const { col: deletingColIndex } = getCellIndices(editor, selectedCell);
  const colsDeleteNumber = api.getColSpan(selectedCell);

  if (getTableMergedColumnCount(table) <= colsDeleteNumber) {
    tx.nodes.remove({ at: tableEntry[1] });

    return;
  }

  const endingColIndex = deletingColIndex + colsDeleteNumber - 1;

  const rowNumber = table.children.length;
  const affectedCellsSet = new Set();
  // iterating by rows is important here to keep the order of affected cells
  for (const rI of Array.from({ length: rowNumber }, (_, i) => i)) {
    for (const cI of Array.from({ length: colsDeleteNumber }, (_, i) => i)) {
      const colIndex = deletingColIndex + cI;
      const found = findCellByIndexes(editor, table, rI, colIndex);

      if (found) {
        affectedCellsSet.add(found);
      }
    }
  }
  const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

  const { squizeColSpanCells } = affectedCells.reduce<{
    squizeColSpanCells: TTableCellElement[];
  }>(
    (acc, cur) => {
      if (!cur) return acc;

      const currentCell = cur as TTableCellElement;
      const { col: curColIndex } = getCellIndices(editor, currentCell);
      const curColSpan = api.getColSpan(currentCell);

      if (curColIndex < deletingColIndex && curColSpan > 1) {
        acc.squizeColSpanCells.push(currentCell);
      } else if (
        curColSpan > 1 &&
        curColIndex + curColSpan - 1 > endingColIndex
      ) {
        acc.squizeColSpanCells.push(currentCell);
      }

      return acc;
    },
    { squizeColSpanCells: [] }
  );

  /** Change colSpans */
  squizeColSpanCells.forEach((cur) => {
    const curCell = cur as TTableCellElement;

    const { col: curColIndex, row: curColRowIndex } = getCellIndices(
      editor,
      curCell
    );
    const curColSpan = api.getColSpan(curCell);

    const curCellPath = getCellPath(
      editor,
      tableEntry,
      curColRowIndex,
      curColIndex
    );

    const curCellEndingColIndex = Math.min(
      curColIndex + curColSpan - 1,
      endingColIndex
    );
    const colsNumberAffected = curCellEndingColIndex - deletingColIndex + 1;
    const colSpan = curColSpan - colsNumberAffected;
    const newCell = cloneDeep({ ...curCell, colSpan });

    if (newCell.attributes?.colspan) {
      newCell.attributes.colspan = colSpan.toString();
    }

    tx.nodes.set<TTableCellElement>(newCell, { at: curCellPath });
  });

  const trEntry = editor.read.nodes.above<TTableRowElement>({
    match: { type: editor.getType(KEYS.tr) },
  });

  /** Remove cells */
  if (
    selectedCell &&
    trEntry &&
    tableEntry &&
    // Cannot delete the last cell
    trEntry[0].children.length > 1
  ) {
    const [tableNode, tablePath] = tableEntry;

    // calc paths to delete
    const paths: Path[][] = [];
    affectedCells.forEach((cur) => {
      const curCell = cur as TTableCellElement;
      const { col: curColIndex, row: curRowIndex } = getCellIndices(
        editor,
        curCell
      );

      if (
        !squizeColSpanCells.includes(curCell) &&
        curColIndex >= deletingColIndex &&
        curColIndex <= endingColIndex
      ) {
        const cellPath = getCellPath(
          editor,
          tableEntry,
          curRowIndex,
          curColIndex
        );

        if (!paths[curRowIndex]) {
          paths[curRowIndex] = [];
        }

        paths[curRowIndex].push(cellPath);
      }
    });

    paths.forEach((cellPaths) => {
      const pathToDelete = cellPaths[0];
      cellPaths.forEach(() => {
        tx.nodes.remove({ at: pathToDelete });
      });
    });

    const { colSizes } = tableNode;

    if (colSizes) {
      const newColSizes = [...colSizes];
      newColSizes.splice(deletingColIndex, colsDeleteNumber);

      tx.nodes.set<TTableElement>({ colSizes: newColSizes }, { at: tablePath });
    }
  }
};
