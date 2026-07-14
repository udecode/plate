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
import { getTableColumnCount } from '../queries';
import { getCellTypes } from '../utils';
import { getCellIndices } from '../utils/getCellIndices';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellPath } from './getCellPath';

export const insertTableMergeRow = (
  editor: BaseEditor,
  tx: EditorUpdateTransaction,
  {
    at,
    before,
    fromRow,
    header,
    select: shouldSelect,
  }: {
    /** Exact path of the row to insert the column at. Will overrule `fromRow`. */
    at?: Path;
    /** Insert the row before the current row instead of after */
    before?: boolean;
    fromRow?: Path;
    header?: boolean;
    select?: boolean;
  } = {}
) => {
  const { api, type } = getEditorPlugin(editor, BaseTablePlugin);

  if (at && !fromRow) {
    const table = editor.read.nodes.get<TTableElement>(at)?.[0];

    if (table?.type === editor.getType(KEYS.table)) {
      if (!table.children.length) return;

      fromRow = at.concat(table.children.length - 1);
      at = undefined;
    }
  }

  const trEntry = editor.read.nodes.find({
    at: fromRow,
    match: { type: editor.getType(KEYS.tr) },
  });

  if (!trEntry) return;

  const [, trPath] = trEntry;

  const tableEntry = editor.read.nodes.above<TTableElement>({
    at: trPath,
    match: { type },
  });

  if (!tableEntry) return;

  const tableNode = tableEntry[0] as TTableElement;

  const cellEntry = editor.read.nodes.find({
    at: fromRow,
    match: { type: getCellTypes(editor) },
  });

  if (!cellEntry) return;

  const [cellNode, cellPath] = cellEntry;
  const cellElement = cellNode as TTableCellElement;
  const cellRowSpan = api.getRowSpan(cellElement);
  const { row: cellRowIndex } = getCellIndices(editor, cellElement);

  const rowPath = cellPath.at(-2)!;
  const tablePath = cellPath.slice(0, -2)!;

  let nextRowIndex: number;
  let checkingRowIndex: number;
  let nextRowPath: number[];

  if (PathApi.isPath(at)) {
    nextRowIndex = at.at(-1)!;
    checkingRowIndex = cellRowIndex - 1;
    nextRowPath = at;
  } else {
    nextRowIndex = before ? cellRowIndex : cellRowIndex + cellRowSpan;
    checkingRowIndex = before
      ? cellRowIndex - 1
      : cellRowIndex + cellRowSpan - 1;
    nextRowPath = [...tablePath, before ? rowPath : rowPath + cellRowSpan];
  }

  const firstRow = nextRowIndex === 0;

  if (firstRow) {
    checkingRowIndex = 0;
  }

  const colCount = getTableColumnCount(tableNode);
  const affectedCellsSet = new Set();
  Array.from({ length: colCount }, (_, i) => i).forEach((cI) => {
    const found = findCellByIndexes(editor, tableNode, checkingRowIndex, cI);

    if (found) {
      affectedCellsSet.add(found);
    }
  });
  const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

  const newRowChildren: TTableCellElement[] = [];
  affectedCells.forEach((cur) => {
    if (!cur) return;

    const curCell = cur as TTableCellElement;
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

    const endCurI = curRowIndex + curRowSpan - 1;

    if (endCurI >= nextRowIndex && !firstRow) {
      const rowSpan = curRowSpan + 1;
      const newCell = cloneDeep({ ...curCell, rowSpan });

      if (newCell.attributes?.rowspan) {
        newCell.attributes.rowspan = rowSpan.toString();
      }

      // make higher
      tx.nodes.set<TTableCellElement>(newCell, { at: currentCellPath });
    } else {
      // add new
      const row = editor.read.nodes.parent(currentCellPath)!;
      const rowElement = row[0] as TTableRowElement;
      const emptyCell = api.createCell({ header, row: rowElement });

      newRowChildren.push({
        ...emptyCell,
        colSpan: curColSpan,
        rowSpan: 1,
      });
    }
  });

  tx.withoutNormalizing(({ tx }) => {
    tx.nodes.insert(
      {
        children: newRowChildren,
        type: editor.getType(KEYS.tr),
      },
      {
        at: nextRowPath,
        select: false,
      }
    );

    if (shouldSelect) {
      const cellEntry = tx.nodes.find({
        at: nextRowPath,
        match: { type: getCellTypes(editor) },
      });

      if (cellEntry) {
        const [, nextCellPath] = cellEntry;
        const point = tx.points.start(nextCellPath);

        if (point) tx.selection.set({ anchor: point, focus: point });
      }
    }
  });
};
