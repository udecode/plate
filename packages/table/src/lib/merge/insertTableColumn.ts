import cloneDeep from 'lodash/cloneDeep.js';
import {
  type EditorUpdateTransaction,
  type Path,
  PathApi,
} from '@platejs/plite';
import { type BaseEditor, getEditorPlugin } from '@platejs/core';
import {
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
  KEYS,
} from '@platejs/utils';

import { BaseTablePlugin } from '../BaseTablePlugin';
import { getCellTypes } from '../utils';
import { getCellIndices } from '../utils/getCellIndices';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellPath } from './getCellPath';

export const insertTableMergeColumn = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  {
    at,
    before,
    fromCell,
    header,
    select: shouldSelect,
  }: {
    /** Exact path of the cell to insert the column at. Will overrule `fromCell`. */
    at?: Path;
    /** Insert the column before the current column instead of after */
    before?: boolean;
    /** Path of the cell to insert the column from. */
    fromCell?: Path;
    header?: boolean;
    select?: boolean;
  } = {}
) => {
  const { api, getOptions, type } = getEditorPlugin(editor, BaseTablePlugin);
  const { initialTableWidth, minColumnWidth } = getOptions();

  if (at && !fromCell) {
    const table = editor.read.nodes.get<TTableElement>(at)?.[0];

    if (table?.type === editor.getType(KEYS.table)) {
      const firstRow = table.children[0] as TTableRowElement | undefined;

      if (!firstRow?.children.length) return;

      fromCell = at.concat([0, firstRow.children.length - 1]);
      at = undefined;
    }
  }

  const cellEntry = fromCell
    ? editor.read.nodes.find<TTableCellElement>({
        at: fromCell,
        match: { type: getCellTypes(editor) },
      })
    : editor.read.nodes.above<TTableCellElement>({
        match: { type: getCellTypes(editor) },
      });

  if (!cellEntry) return;

  const [, cellPath] = cellEntry;
  const cell = cellEntry[0];

  const tableEntry = editor.read.nodes.above<TTableElement>({
    at: cellPath,
    match: { type },
  });

  if (!tableEntry) return;

  const [tableNode, tablePath] = tableEntry;

  const { col: cellColIndex } = getCellIndices(editor, cell);
  const cellColSpan = api.getColSpan(cell);

  let nextColIndex: number;
  let checkingColIndex: number;

  if (PathApi.isPath(at)) {
    nextColIndex = cellColIndex;
    checkingColIndex = cellColIndex - 1;
  } else {
    nextColIndex = before ? cellColIndex : cellColIndex + cellColSpan;
    checkingColIndex = before ? cellColIndex : cellColIndex + cellColSpan - 1;
  }

  const rowNumber = tableNode.children.length;
  const firstCol = nextColIndex <= 0;

  let placementCorrection = before ? 0 : 1;

  if (firstCol) {
    checkingColIndex = 0;
    placementCorrection = 0;
  }

  const affectedCellsSet = new Set();
  Array.from({ length: rowNumber }, (_, i) => i).forEach((rI) => {
    const found = findCellByIndexes(editor, tableNode, rI, checkingColIndex);

    if (found) {
      affectedCellsSet.add(found);
    }
  });
  const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

  affectedCells.forEach((curCell) => {
    const { col: curColIndex, row: curRowIndex } = getCellIndices(
      editor,
      curCell
    );

    const curRowSpan = api.getRowSpan(curCell);
    const curColSpan = api.getColSpan(curCell);

    const currentCellPath = getCellPath(
      editor,
      tableEntry,
      curRowIndex,
      curColIndex
    );

    const endCurI = curColIndex + curColSpan - 1;

    if (endCurI >= nextColIndex && !firstCol && !before) {
      const colSpan = curColSpan + 1;
      const newCell = cloneDeep({ ...curCell, colSpan });

      if (newCell.attributes?.colspan) {
        newCell.attributes.colspan = colSpan.toString();
      }

      tx.nodes.set<TTableCellElement>(newCell, { at: currentCellPath });
    } else {
      const curRowPath = currentCellPath.slice(0, -1);
      const curColPath = currentCellPath.at(-1)!;
      const placementPath = [
        ...curRowPath,
        before ? curColPath : curColPath + placementCorrection,
      ];

      const row = editor.read.nodes.parent(currentCellPath)!;
      const rowElement = row[0] as TTableRowElement;
      const emptyCell = {
        ...api.createCell({ header, row: rowElement }),
        colSpan: 1,
        rowSpan: curRowSpan,
      };
      tx.nodes.insert(emptyCell, {
        at: placementPath,
        select: shouldSelect,
      });
    }
  });

  tx.withoutNormalizing(({ tx }) => {
    const { colSizes } = tableNode;

    if (colSizes) {
      let newColSizes = [
        ...colSizes.slice(0, nextColIndex),
        0,
        ...colSizes.slice(nextColIndex),
      ];

      if (initialTableWidth) {
        newColSizes[nextColIndex] =
          colSizes[nextColIndex] ??
          colSizes[nextColIndex - 1] ??
          initialTableWidth / colSizes.length;

        const oldTotal = colSizes.reduce((a, b) => a + b, 0);
        const newTotal = newColSizes.reduce((a, b) => a + b, 0);
        const maxTotal = Math.max(oldTotal, initialTableWidth);

        if (newTotal > maxTotal) {
          const factor = maxTotal / newTotal;
          newColSizes = newColSizes.map((size) =>
            Math.max(minColumnWidth ?? 0, Math.floor(size * factor))
          );
        }
      }

      tx.nodes.set<TTableElement>(
        {
          colSizes: newColSizes,
        },
        {
          at: tablePath,
        }
      );
    }
  });
};
