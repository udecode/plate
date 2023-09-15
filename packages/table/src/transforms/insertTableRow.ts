import {
  findNode,
  findNodePath,
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
import {
  TablePlugin,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '../types';
import { findCellByIndexes, getCellTypes, getEmptyCellNode } from '../utils';

const createEmptyCell = <V extends Value>(
  editor: PlateEditor<V>,
  row: TTableRowElement,
  colSpan: number,
  newCellChildren?: TDescendant[],
  header?: boolean
) => {
  const isHeaderRow =
    header === undefined
      ? (row as TElement).children.every(
          (c) => c.type === getPluginType(editor, ELEMENT_TH)
        )
      : header;

  return {
    ...getEmptyCellNode(editor, {
      header: isHeaderRow,
      newCellChildren,
    }),
    colSpan,
  };
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

  const tableEntry = getBlockAbove(editor, {
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
  const cellRowIndex = cellElement.rowIndex!;
  const cellRowSpan = cellElement.rowSpan!;

  const rowPath = cellPath.at(-2)!;
  const tablePath = cellPath.slice(0, -2)!;

  let nextRowIndex: number;
  let checkingRowIndex: number;
  let nextRowPath: number[];
  if (Path.isPath(at)) {
    nextRowIndex = cellRowIndex;
    checkingRowIndex = cellRowIndex - 1;
    nextRowPath = [...tablePath, rowPath];
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
    const found = findCellByIndexes(tableNode, checkingRowIndex, cI);
    affectedCellsSet.add(found);
  });
  const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

  const newRowChildren: TTableCellElement[] = [];
  affectedCells.forEach((cur) => {
    if (!cur) return;

    const curCell = cur as TTableCellElement;
    const curRowIndex = curCell.rowIndex!;
    const curRowSpan = curCell.rowSpan!;
    const curColSpan = curCell.colSpan!;
    const currentCellPath = findNodePath(editor, curCell)!;

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
        curColSpan,
        newCellChildren,
        header
      ) as TTableCellElement;

      newRowChildren.push(emptyCell);
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
