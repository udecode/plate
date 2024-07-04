import {
  type PlateEditor,
  type TDescendant,
  type Value,
  findNode,
  getPluginOptions,
  getPluginType,
  insertElements,
  removeNodes,
  withoutNormalizing,
} from '@udecode/plate-common/server';

import type {
  TTableCellElement,
  TTableRowElement,
  TablePlugin,
} from '../types';

import { ELEMENT_TABLE, ELEMENT_TH, ELEMENT_TR } from '../createTablePlugin';
import { getTableGridAbove } from '../queries';
import { getColSpan } from '../queries/getColSpan';
import { getRowSpan } from '../queries/getRowSpan';
import { getCellIndices } from './getCellIndices';

export const unmergeTableCells = <V extends Value = Value>(
  editor: PlateEditor<V>
) => {
  withoutNormalizing(editor, () => {
    const {
      _cellIndices: cellIndices,
      cellFactory,
      getCellChildren,
    } = getPluginOptions<TablePlugin, V>(editor, ELEMENT_TABLE);

    const cellEntries = getTableGridAbove(editor, { format: 'cell' });
    const [[cellElem, path]] = cellEntries;

    // creating new object per iteration is essential here
    const createEmptyCell = (children?: TDescendant[]) => {
      return {
        ...cellFactory!({
          children,
          header: cellElem.type === getPluginType(editor, ELEMENT_TH),
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

    const getColPathForRow = (row: number) => {
      let newColPath = 0;

      const rowEntry = findNode(editor, {
        at: [...tablePath, row],
        match: { type: getPluginType(editor, ELEMENT_TR) },
      })!; // TODO: improve typing

      if (!rowEntry) {
        return newColPath;
      }

      const rowEl = rowEntry[0] as TTableRowElement;

      for (const item of rowEl.children) {
        const { col: c } = getCellIndices(
          cellIndices!,
          item as TTableCellElement
        )!;

        if (c === col - 1) {
          newColPath = rowEl.children.indexOf(item) + 1;

          break;
        }
        if (col + getColSpan(cellElem as TTableCellElement) === c - 1) {
          newColPath = rowEl.children.indexOf(item);

          break;
        }
      }

      return newColPath;
    };

    // Generate an array of cell paths from the row and col spans and then insert empty cells at those paths
    for (let i = 0; i < rowSpan; i++) {
      const currentRowPath = rowPath + i;
      const pathForNextRows = getColPathForRow(currentRowPath);
      const newRowChildren: TTableRowElement[] = [];
      const _rowPath = [...tablePath, currentRowPath];
      const rowEntry = findNode(editor, {
        at: _rowPath,
        match: { type: getPluginType(editor, ELEMENT_TABLE) },
      });

      for (let j = 0; j < colPaths.length; j++) {
        const cellChildren = getCellChildren!(cellElem);

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
            type: getPluginType(editor, ELEMENT_TR),
          },
          { at: _rowPath }
        );
      }
    }
  });
};
