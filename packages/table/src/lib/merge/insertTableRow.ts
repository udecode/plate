import {
  type SlateEditor,
  findNode,
  getBlockAbove,
  getEditorPlugin,
  getLastChildPath,
  getNode,
  getParentNode,
  insertElements,
  setNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import cloneDeep from 'lodash/cloneDeep.js';
import { Path } from 'slate';

import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';

import { BaseTablePlugin, BaseTableRowPlugin } from '../BaseTablePlugin';
import { getTableColumnCount } from '../queries';
import { getCellTypes } from '../utils';
import { getCellIndices } from '../utils/getCellIndices';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellPath } from './getCellPath';

export const insertTableMergeRow = (
  editor: SlateEditor,
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
    const table = getNode<TTableElement>(editor, at);

    if (table?.type === editor.getType(BaseTablePlugin)) {
      fromRow = getLastChildPath([table, at]);
      at = undefined;
    }
  }

  const trEntry = fromRow
    ? findNode(editor, {
        at: fromRow,
        match: { type: editor.getType(BaseTableRowPlugin) },
      })
    : getBlockAbove(editor, {
        match: { type: editor.getType(BaseTableRowPlugin) },
      });

  if (!trEntry) return;

  const [, trPath] = trEntry;

  const tableEntry = getBlockAbove<TTableElement>(editor, {
    at: trPath,
    match: { type },
  });

  if (!tableEntry) return;

  const tableNode = tableEntry[0] as TTableElement;

  const cellEntry = findNode(editor, {
    at: fromRow,
    match: { type: getCellTypes(editor) },
  });

  if (!cellEntry) return;

  const [cellNode, cellPath] = cellEntry;
  const cellElement = cellNode as TTableCellElement;
  const cellRowSpan = api.table.getRowSpan(cellElement);
  const { row: cellRowIndex } = getCellIndices(editor, {
    cellNode: cellElement,
    tableNode: tableNode,
  });

  const rowPath = cellPath.at(-2)!;
  const tablePath = cellPath.slice(0, -2)!;

  let nextRowIndex: number;
  let checkingRowIndex: number;
  let nextRowPath: number[];

  if (Path.isPath(at)) {
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
    const { col: curColIndex, row: curRowIndex } = getCellIndices(editor, {
      cellNode: curCell,
      tableNode: tableNode,
    });

    const curRowSpan = api.table.getRowSpan(curCell);
    const curColSpan = api.table.getColSpan(curCell);
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
      setNodes<TTableCellElement>(editor, newCell, { at: currentCellPath });
    } else {
      // add new
      const row = getParentNode(editor, currentCellPath)!;
      const rowElement = row[0] as TTableRowElement;
      const emptyCell = api.create.tableCell({ header, row: rowElement });

      newRowChildren.push({
        ...emptyCell,
        colSpan: curColSpan,
        rowSpan: 1,
      });
    }
  });

  withoutNormalizing(editor, () => {
    insertElements(
      editor,
      {
        children: newRowChildren,
        type: editor.getType(BaseTableRowPlugin),
      },
      {
        at: nextRowPath,
        select: shouldSelect,
      }
    );
  });
};
