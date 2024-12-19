import type { Path } from 'slate';

import {
  type SlateEditor,
  type TDescendant,
  findNode,
  getEditorPlugin,
  insertElements,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common';
import { findPath } from '@udecode/plate-common/react';

import {
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
  BaseTableRowPlugin,
  computeCellIndices,
  getCellIndices,
  getColSpan,
  getRowSpan,
} from '../../lib';
import {
  TableCellHeaderPlugin,
  TablePlugin,
  TableRowPlugin,
} from '../TablePlugin';
import { getTableGridAbove } from '../queries';

export const unmergeTableCells = (editor: SlateEditor) => {
  const { api, getOptions } = getEditorPlugin(editor, TablePlugin);
  const { _cellIndices: cellIndices } = getOptions();
  const tableRowType = editor.getType(TableRowPlugin);

  withoutNormalizing(editor, () => {
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });
    const [[cellElem, path]] = cellEntries;

    // creating new object per iteration is essential here
    const createEmptyCell = (children?: TDescendant[]) => {
      return {
        ...api.create.cell!({
          children,
          header: cellElem.type === editor.getType(TableCellHeaderPlugin),
        }),
        colSpan: 1,
        rowSpan: 1,
      };
    };

    const tablePath = path.slice(0, -2);

    const cellPath = path.slice(-2);
    const [rowPath, colPath] = cellPath;
    const colSpan = getColSpan(cellElem as TTableCellElement);
    const rowSpan = getRowSpan(cellElem as TTableCellElement);

    // Generate an array of column paths from the colspan
    const colPaths: number[] = [];

    for (let i = 0; i < colSpan; i++) {
      colPaths.push(colPath + i);
    }

    // Remove the original merged cell from the editor
    removeNodes(editor, { at: path });

    const { col } = getCellIndices(
      cellIndices!,
      cellElem as TTableCellElement
    )!;

    const getClosestColPathForRow = (row: number, targetCol: number) => {
      const rowEntry = findNode(editor, {
        at: [...tablePath, row],
        match: { type: tableRowType },
      });

      if (!rowEntry) {
        return 0;
      }

      const rowEl = rowEntry[0] as TTableRowElement;
      let closestColPath: Path = [];
      let smallestDiff = Number.POSITIVE_INFINITY;
      let isDirectionLeft = false;

      rowEl.children.forEach((cell) => {
        const cellElement = cell as TTableCellElement;
        const { col: cellCol } = getCellIndices(cellIndices!, cellElement)!;

        const diff = Math.abs(cellCol - targetCol);

        if (diff < smallestDiff) {
          smallestDiff = diff;
          closestColPath = findPath(editor, cellElement)!;
          isDirectionLeft = cellCol < targetCol;
        }
      });

      if (closestColPath.length > 0) {
        const lastIndex = closestColPath.at(-1)!;

        if (isDirectionLeft) {
          return lastIndex + 1;
        }

        return lastIndex;
      }

      return 1;
    };

    // Generate an array of cell paths from the row and col spans and then insert empty cells at those paths
    for (let i = 0; i < rowSpan; i++) {
      const currentRowPath = rowPath + i;
      const pathForNextRows = getClosestColPathForRow(currentRowPath, col);
      const newRowChildren: TTableRowElement[] = [];
      const _rowPath = [...tablePath, currentRowPath];
      const rowEntry = findNode(editor, {
        at: _rowPath,
        match: { type: tableRowType },
      });

      for (let j = 0; j < colPaths.length; j++) {
        const cellChildren = api.table.getCellChildren!(cellElem);

        const cellToInsert =
          i === 0 && j === 0
            ? createEmptyCell(cellChildren)
            : createEmptyCell();

        // if row exists, insert into it, otherwise insert row
        if (rowEntry) {
          const currentColPath = i === 0 ? colPaths[j] : pathForNextRows;
          const pathForNewCell = [...tablePath, currentRowPath, currentColPath];

          insertElements(editor, cellToInsert, { at: pathForNewCell });
        } else {
          newRowChildren.push(cellToInsert);
        }
      }

      if (!rowEntry) {
        insertElements(
          editor,
          {
            children: newRowChildren,
            type: editor.getType(BaseTableRowPlugin),
          },
          { at: _rowPath }
        );
      }
    }

    // Recalculate the split cells
    const tableElement = findNode<TTableElement>(editor, {
      at: tablePath,
    })?.[0];

    if (tableElement) {
      computeCellIndices(editor, tableElement);
    }
  });
};
