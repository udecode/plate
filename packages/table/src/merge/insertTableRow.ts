import {
  findNode,
  getBlockAbove,
  getParentNode,
  getPluginOptions,
  getPluginType,
  insertElements,
  PlateEditor,
  select,
  setNodes,
  TDescendant,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR } from '../createTablePlugin';
import { getTableColumnCount } from '../queries';
import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';
import { getCellTypes, getEmptyCellNode } from '../utils';
import { findCellByIndexes } from './findCellByIndexes';
import { getCellPath } from './getCellPath';
import { getIndices } from './getIndices';

const createEmptyCell = <V extends Value>(
  editor: PlateEditor<V>,
  row: TTableRowElement,
  newCellChildren?: TDescendant[],
  header?: boolean
) => {
  const isHeaderRow =
    header === undefined
      ? (row as TElement).children.every(
          (c) => c.type === getPluginType(editor, ELEMENT_TH)
        )
      : header;

  return getEmptyCellNode(editor, {
    header: isHeaderRow,
    newCellChildren,
  });
};

export const insertTableRow = <V extends Value>(
  editor: PlateEditor<V>,
  {
    header,
    fromRow,
    at,
    disableSelect,
  }: {
    header?: boolean;
    fromRow?: Path;
    /**
     * Exact path of the row to insert the column at.
     * Will overrule `fromRow`.
     */
    at?: Path;
    disableSelect?: boolean;
  } = {}
) => {
  const options = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

  const trEntry = fromRow
    ? findNode(editor, {
        at: fromRow,
        match: { type: getPluginType(editor, ELEMENT_TR) },
      })
    : getBlockAbove(editor, {
        match: { type: getPluginType(editor, ELEMENT_TR) },
      });
  if (!trEntry) return;

  const [, trPath] = trEntry;

  const tableEntry = getBlockAbove<TTableElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
    at: trPath,
  });
  if (!tableEntry) return;
  const tableNode = tableEntry[0] as TTableElement;

  const { newCellChildren } = getPluginOptions<TablePlugin, V>(
    editor,
    ELEMENT_TABLE
  );
  const cellEntry = findNode(editor, {
    at: fromRow,
    match: { type: getCellTypes(editor) },
  });
  if (!cellEntry) return;
  const [cellNode, cellPath] = cellEntry;
  const cellElement = cellNode as TTableCellElement;
  const cellRowSpan = getRowSpan(cellElement);
  const { row: cellRowIndex } = getIndices(options, cellElement)!;

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
    nextRowIndex = cellRowIndex + cellRowSpan;
    checkingRowIndex = cellRowIndex + cellRowSpan - 1;
    nextRowPath = [...tablePath, rowPath + cellRowSpan];
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
    const { row: curRowIndex, col: curColIndex } = getIndices(
      options,
      curCell
    )!;

    const curRowSpan = getRowSpan(curCell);
    const curColSpan = getColSpan(curCell);
    const currentCellPath = getCellPath(
      editor,
      tableEntry,
      curRowIndex,
      curColIndex
    );

    const endCurI = curRowIndex + curRowSpan - 1;
    if (endCurI >= nextRowIndex && !firstRow) {
      // make higher
      setNodes<TTableCellElement>(
        editor,
        { ...curCell, rowSpan: curRowSpan + 1 },
        { at: currentCellPath }
      );
    } else {
      // add new
      const row = getParentNode(editor, currentCellPath)!;
      const rowElement = row[0] as TTableRowElement;
      const emptyCell = createEmptyCell(
        editor,
        rowElement,
        newCellChildren,
        header
      ) as TTableCellElement;

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
        type: getPluginType(editor, ELEMENT_TR),
        children: newRowChildren,
      },
      {
        at: nextRowPath,
      }
    );
  });

  if (!disableSelect) {
    const nextCellPath = cellPath;
    if (Path.isPath(at)) {
      nextCellPath[nextCellPath.length - 2] = at.at(-2)!;
    } else {
      nextCellPath[nextCellPath.length - 2] += cellRowSpan;
    }

    select(editor, nextCellPath);
  }
};
