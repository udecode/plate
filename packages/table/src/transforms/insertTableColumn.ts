import {
  findNode,
  findNodePath,
  getBlockAbove,
  getParentNode,
  getPluginOptions,
  getPluginType,
  insertElements,
  PlateEditor,
  setNodes,
  TDescendant,
  TElement,
  Value,
  withoutNormalizing,
} from '@udecode/plate-common';
import { Path } from 'slate';

import { ELEMENT_TABLE, ELEMENT_TH } from '../createTablePlugin';
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
  rowSpan: number,
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
    rowSpan,
  };
};

export const insertTableColumn = <V extends Value>(
  editor: PlateEditor<V>,
  {
    disableSelect,
    fromCell,
    at,
    header,
  }: {
    header?: boolean;

    /**
     * Path of the cell to insert the column from.
     */
    fromCell?: Path;

    /**
     * Exact path of the cell to insert the column at.
     * Will overrule `fromCell`.
     */
    at?: Path;

    /**
     * Disable selection after insertion.
     */
    disableSelect?: boolean;
  } = {}
) => {
  const cellEntry = fromCell
    ? findNode(editor, {
        at: fromCell,
        match: { type: getCellTypes(editor) },
      })
    : getBlockAbove(editor, {
        match: { type: getCellTypes(editor) },
      });
  if (!cellEntry) return;

  const [, cellPath] = cellEntry;
  const cell = cellEntry[0] as TTableCellElement;

  const tableEntry = getBlockAbove<TTableElement>(editor, {
    match: { type: getPluginType(editor, ELEMENT_TABLE) },
    at: cellPath,
  });
  if (!tableEntry) return;

  const { newCellChildren, initialTableWidth, minColumnWidth } =
    getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);
  const [tableNode, tablePath] = tableEntry;

  const cellColIndex = cell.colIndex!;
  const cellColSpan = cell.colSpan!;

  let nextColIndex: number;
  let checkingColIndex: number;
  if (Path.isPath(at)) {
    nextColIndex = cellColIndex;
    checkingColIndex = cellColIndex - 1;
  } else {
    nextColIndex = cellColIndex + cellColSpan;
    checkingColIndex = cellColIndex + cellColSpan - 1;
  }

  const currentRowIndex = cellPath.at(-2); // recheck it
  const rowNumber = tableNode.children.length;
  const firstCol = nextColIndex <= 0;

  // const colCount = getTableColumnCount(tableNode);
  // const lastRow = nextColIndex === colCount;

  let placementCorrection = 1;
  if (firstCol) {
    checkingColIndex = 0;
    placementCorrection = 0;
  }

  const affectedCellsSet = new Set();
  Array.from({ length: rowNumber }, (_, i) => i).forEach((rI) => {
    const found = findCellByIndexes(tableNode, rI, checkingColIndex);
    affectedCellsSet.add(found);
  });
  const affectedCells = Array.from(affectedCellsSet) as TTableCellElement[];

  affectedCells.forEach((cur) => {
    const curCell = cur as TTableCellElement;
    const curColIndex = curCell.colIndex!;
    const curColSpan = curCell.colSpan!;
    const curRowSpan = curCell.rowSpan!;
    const currentCellPath = findNodePath(editor, curCell)!;

    const endCurI = curColIndex + curColSpan - 1;
    if (endCurI >= nextColIndex && !firstCol) {
      // make wider
      setNodes<TTableCellElement>(
        editor,
        { ...curCell, colSpan: curColSpan + 1 },
        { at: currentCellPath }
      );
    } else {
      // add new
      const curRowPath = currentCellPath.slice(0, -1);
      const curColPath = currentCellPath.at(-1)!;
      const placementPath = [...curRowPath, curColPath + placementCorrection];

      const row = getParentNode(editor, currentCellPath)!;
      const rowElement = row[0] as TTableRowElement;
      const emptyCell = createEmptyCell(
        editor,
        rowElement,
        curRowSpan,
        newCellChildren,
        header
      );
      insertElements(editor, emptyCell, {
        at: placementPath,
        select: !disableSelect && curCell.rowIndex === currentRowIndex,
      });
    }
  });

  withoutNormalizing(editor, () => {
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

      setNodes<TTableElement>(
        editor,
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
