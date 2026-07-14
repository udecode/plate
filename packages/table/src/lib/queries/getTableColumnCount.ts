import type {
  TTableCellElement,
  TTableElement,
  TTableRowElement,
} from '@platejs/utils';

export const getTableColumnCount = (tableNode: TTableElement): number => {
  const firstRow = tableNode.children[0] as TTableRowElement | undefined;

  return (
    (firstRow?.children as TTableCellElement[] | undefined)?.reduce(
      (count, cell) =>
        count + Number(cell.colSpan ?? cell.attributes?.colspan ?? 1),
      0
    ) ?? 0
  );
};
