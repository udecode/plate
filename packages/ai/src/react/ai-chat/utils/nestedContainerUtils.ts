import { type Descendant, ElementApi } from '@platejs/plite';
import { type TTableElement, KEYS } from '@platejs/utils';

/** Check if nodes is a single table with single cell */
export const isSingleCellTable = (
  nodes: Descendant[]
): nodes is [TTableElement] => {
  if (nodes.length !== 1) return false;

  const table = nodes[0];

  if (!ElementApi.isElement(table) || table.type !== KEYS.table) return false;

  const rows = table.children;

  if (rows.length !== 1) return false;

  const row = rows[0];

  if (!ElementApi.isElement(row) || row.type !== KEYS.tr) return false;

  const cells = row.children;

  if (cells.length !== 1) return false;

  const cell = cells[0];

  return ElementApi.isElement(cell) && cell.type === KEYS.td;
};

/** Extract td children from single-cell table */
export const getTableCellChildren = (table: TTableElement): Descendant[] => {
  const row = table.children[0];

  if (!ElementApi.isElement(row)) return [];

  const cell = row.children[0];

  if (!ElementApi.isElement(cell)) return [];

  return cell.children;
};
