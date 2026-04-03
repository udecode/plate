import type {
  NodeEntry,
  Path,
  SlateEditor,
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from 'platejs';

import { getCellIndicesWithSpans } from '../merge/getCellIndicesWithSpans';
import { getCellIndices } from '../utils/getCellIndices';
import { getTableEntries } from './getTableEntries';

type TableCellLookup = Map<string, NodeEntry<TTableCellElement>>;

const adjacentTableCellLookup = new WeakMap<TTableElement, TableCellLookup>();

const getLookupKey = (row: number, col: number) => `${row}:${col}`;

const createTableCellLookup = (
  editor: SlateEditor,
  tableEntry: NodeEntry<TTableElement>
) => {
  const [table, tablePath] = tableEntry;
  const cachedLookup = adjacentTableCellLookup.get(table);

  if (cachedLookup) return cachedLookup;

  const nextLookup: TableCellLookup = new Map();

  table.children.forEach((rowNode, rowIndex) => {
    (rowNode as TTableRowElement).children.forEach((cellNode, cellIndex) => {
      const cellEntry = [
        cellNode as TTableCellElement,
        tablePath.concat([rowIndex, cellIndex]),
      ] as NodeEntry<TTableCellElement>;
      const indices = getCellIndices(editor, cellEntry[0]);
      const { col: endCol, row: endRow } = getCellIndicesWithSpans(
        indices,
        cellEntry[0]
      );

      for (let row = indices.row; row <= endRow; row++) {
        for (let col = indices.col; col <= endCol; col++) {
          nextLookup.set(getLookupKey(row, col), cellEntry);
        }
      }
    });
  });

  adjacentTableCellLookup.set(table, nextLookup);

  return nextLookup;
};

export const getAdjacentTableCell = (
  editor: SlateEditor,
  {
    at,
    deltaCol = 0,
    deltaRow = 0,
  }: {
    at?: Path;
    deltaCol?: number;
    deltaRow?: number;
  } = {}
) => {
  const entries = getTableEntries(editor, { at });

  if (!entries) return;

  const [cell] = entries.cell as NodeEntry<TTableCellElement>;
  const tableEntry = entries.table as NodeEntry<TTableElement>;
  const { col, row } = getCellIndices(editor, cell);

  const nextCol = col + deltaCol;
  const nextRow = row + deltaRow;

  if (nextCol < 0 || nextRow < 0) return;

  return createTableCellLookup(editor, tableEntry).get(
    getLookupKey(nextRow, nextCol)
  );
};
