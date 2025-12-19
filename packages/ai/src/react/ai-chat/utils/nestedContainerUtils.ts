import {
  KEYS,
  type Descendant,
  type TElement,
  type TTableCellElement,
  type TTableElement,
  type TTableRowElement,
} from 'platejs';

/** Check if nodes is a single table with single cell */
export const isSingleCellTable = (
  nodes: Descendant[]
): nodes is [TTableElement] => {
  if (nodes.length !== 1) return false;

  const table = nodes[0] as TElement;

  if (table.type !== KEYS.table) return false;

  const rows = table.children as TElement[];

  if (rows.length !== 1) return false;

  const row = rows[0] as TElement;

  if (row.type !== KEYS.tr) return false;

  const cells = row.children as TElement[];

  if (cells.length !== 1) return false;

  const cell = cells[0] as TElement;

  return cell.type === KEYS.td;
};

/** Extract td children from single-cell table */
export const getTableCellChildren = (table: TTableElement): Descendant[] => {
  const row = table.children[0] as TTableRowElement;
  const cell = row.children[0] as TTableCellElement;

  return cell.children;
};
